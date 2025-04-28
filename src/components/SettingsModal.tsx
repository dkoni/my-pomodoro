// ChangeEvent = onChangeの型定義
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { MusicSetting } from './MusicPlayer';
import { MdPalette } from 'react-icons/md';
import { FiVolume2 } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";



// interface Task {
//   id: string;
//   text: string;
//   completed: boolean;
// }

// TODO 違和感のある型定義
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    focusMusic: MusicSetting;
    breakMusic: MusicSetting;
    workAlarm: string; // Keep these for saving
    shortBreakAlarm: string;
    longBreakAlarm: string;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    theme: string;
  }) => void;
  initialAutoStartBreaks: boolean; // 追加
  initialAutoStartWork: boolean;   // 追加
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  focusMusic: MusicSetting; // Receive initial music settings
  breakMusic: MusicSetting;
  workAlarm: string; // Receive initial alarm settings
  shortBreakAlarm: string;
  longBreakAlarm: string;
  tickingSounds: string[]; // List of available ticking sounds
  alarmSounds: string[]; // List of available alarm sounds
  // Add theme prop if needed for initial state
  currentTheme: string; // Receive current theme
}

// Define sound paths relative to the public directory
const SOUND_BASE_PATH = '/sounds/';
const TICKING_PATH = `${SOUND_BASE_PATH}ticking/`;
const ALARM_PATH = `${SOUND_BASE_PATH}alarm/`;

const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter'
];

export const SettingsModal = ({
  isOpen,
  onClose,
  onSave,
  workMinutes: initialWork,
  shortBreakMinutes: initialShort,
  longBreakMinutes: initialLong,
  longBreakInterval: initialInterval,
  focusMusic: initialFocusMusic,
  breakMusic: initialBreakMusic,
  workAlarm: initialWorkAlarm,
  shortBreakAlarm: initialShortBreakAlarm,
  longBreakAlarm: initialLongBreakAlarm,
  initialAutoStartBreaks, // 追加
  initialAutoStartWork,   // 追加
  tickingSounds,
  alarmSounds,
  currentTheme
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState('timer');

  // TODO ローカルストレージから読み込むものとApp.tsxで管理するものとが混在していて良くない
  // 一般的には、App.tsx から初期値を渡す方が、コードの一貫性、可読性、保守性の観点から優れている

  // Timer State
  const [workMinutes, setWorkMinutes] = useState(initialWork);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(initialShort);
  const [longBreakMinutes, setLongBreakMinutes] = useState(initialLong);
  const [longBreakInterval, setLongBreakInterval] = useState(initialInterval);
  const [autoStartBreaks, setAutoStartBreaks] = useState(initialAutoStartBreaks); // props から初期化
  const [autoStartWork, setAutoStartWork] = useState(initialAutoStartWork);     // props から初期化

  // Sound State
  const [focusMusicSetting, setFocusMusicSetting] = useState<MusicSetting>(initialFocusMusic);
  const [breakMusicSetting, setBreakMusicSetting] = useState<MusicSetting>(initialBreakMusic);
  const [workAlarm, setWorkAlarm] = useState(initialWorkAlarm);
  const [shortBreakAlarm, setShortBreakAlarm] = useState(initialShortBreakAlarm);
  const [longBreakAlarm, setLongBreakAlarm] = useState(initialLongBreakAlarm);

  // Appearance State
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);


  const handleSave = () => {
    onSave({
      workMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      longBreakInterval,
      focusMusic: focusMusicSetting, // Use state for music
      breakMusic: breakMusicSetting,
      workAlarm, // Use state for alarms
      shortBreakAlarm,
      longBreakAlarm,
      autoStartBreaks,
      autoStartWork,
      theme: selectedTheme
    });
    onClose(); // 保存後にモーダルを閉じる
  };

  // --- Sound Setting Handlers ---
  const handleMusicTypeChange = (
    type: 'focus' | 'break',
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const newType = e.target.value as 'default' | 'youtube';
    const setter = type === 'focus' ? setFocusMusicSetting : setBreakMusicSetting;
    setter(prev => ({ ...prev, type: newType, url: newType === 'youtube' ? '' : prev.url })); // Reset URL for YouTube initially
  };

  const handleMusicUrlChange = (
    type: 'focus' | 'break',
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newUrl = e.target.value;
    const setter = type === 'focus' ? setFocusMusicSetting : setBreakMusicSetting;
    setter(prev => ({ ...prev, url: newUrl }));
  };

  const handleVolumeChange = (
    type: 'focus' | 'break',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = Number(e.target.value);
    const setter = type === 'focus' ? setFocusMusicSetting : setBreakMusicSetting;
    setter(prev => ({ ...prev, volume: newVolume }));
  };

  // タブ情報をまとめる
  // const tabs = [
  //   { id: 'timer', label: '⏱️ Timer' },
  //   { id: 'sound', label: '🎵 Sound' },
  //   { id: 'appearance', label: '🎨 Appearance' },
  // ];
  const tabs = [
    { id: 'timer', label: 'Timer', icon: <FaRegClock size={20} /> },
    { id: 'sound', label: 'Sound', icon: <FiVolume2 size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <MdPalette size={20} /> },
  ];

  // Timer Settingsで使用する関数
  const handleTimeInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(999, Number(e.target.value)));
    setter(value);
  };

  const timeInputs = [
    { label: "Work Duration", value: workMinutes, setter: setWorkMinutes, unit: "minutes" },
    { label: "Short Break", value: shortBreakMinutes, setter: setShortBreakMinutes, unit: "minutes" },
    { label: "Long Break", value: longBreakMinutes, setter: setLongBreakMinutes, unit: "minutes" },
    { label: "Long Break Interval", value: longBreakInterval, setter: setLongBreakInterval, unit: "pomodoros" },
  ];

  const toggleOptions = [
    {
      label: "Auto Start Breaks",
      checked: autoStartBreaks,
      onChange: (checked: boolean) => setAutoStartBreaks(checked),
    },
    {
      label: "Auto Start Focus Sessions",
      checked: autoStartWork,
      onChange: (checked: boolean) => setAutoStartWork(checked),
    },
  ];

  // Sound Settingsで使用する関数
  const musicSettings = [
    {
      label: "Focus Music",
      type: focusMusicSetting.type,
      url: focusMusicSetting.url,
      volume: focusMusicSetting.volume,
      onTypeChange: (e: ChangeEvent<HTMLSelectElement>) => handleMusicTypeChange('focus', e),
      onUrlChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleMusicUrlChange('focus', e),
      onVolumeChange: (e: ChangeEvent<HTMLInputElement>) => handleVolumeChange('focus', e),
      color: "primary",
    },
    {
      label: "Break Music",
      type: breakMusicSetting.type,
      url: breakMusicSetting.url,
      volume: breakMusicSetting.volume,
      onTypeChange: (e: ChangeEvent<HTMLSelectElement>) => handleMusicTypeChange('break', e),
      onUrlChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleMusicUrlChange('break', e),
      onVolumeChange: (e: ChangeEvent<HTMLInputElement>) => handleVolumeChange('break', e),
      color: "secondary",
    }
  ];

  const alarmSettings = [
    {
      label: "End of Focus",
      value: workAlarm,
      onChange: (e: ChangeEvent<HTMLSelectElement>) => setWorkAlarm(e.target.value),
    },
    {
      label: "End of Short Break",
      value: shortBreakAlarm,
      onChange: (e: ChangeEvent<HTMLSelectElement>) => setShortBreakAlarm(e.target.value),
    },
    {
      label: "End of Long Break",
      value: longBreakAlarm,
      onChange: (e: ChangeEvent<HTMLSelectElement>) => setLongBreakAlarm(e.target.value),
    }
  ];

  // モーダルを閉じる処理
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target instanceof HTMLDialogElement) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // -- render --
  return (
    <dialog
      ref={modalRef}
      open={isOpen}
      className="modal modal-bottom sm:modal-middle"
      onClick={handleBackdropClick}
    >
      <div className="modal-box p-0">
        {/* ✖️ボタン */}
        {/* <button
          type="button"
          className="btn btn-sm btn-base-100 btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✖
        </button> */}
        <div className="flex flex-col">
          {/* タブエリア */}
          <div className="flex border-b">
            {tabs.map((tab) => (
              // <button
              //   key={tab.id}
              //   className={`flex-1 flex flex-row items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition ${
              //     activeTab === tab.id
              //       ? 'border-b-2 border-primary text-primary'
              //       : 'text-base-content/70 hover:text-primary'
              //   }`}
              //   onClick={() => setActiveTab(tab.id)}
              // >
              //   {tab.icon}
              //   <span>{tab.label}</span>
              // </button>
              <button
                key={tab.id}
                className={`flex-1 flex flex-row items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id ? 'border-b-2 border-primary' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* コンテンツエリア */}
          <div className="flex-1 p-6 max-h-[70vh] overflow-y-auto">
            {/* Timer Settings */}
            {activeTab === 'timer' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Timer Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {timeInputs.map((item, index) => (
                    <div className="form-control" key={index}>
                      <label className="label pb-1">
                        <span className="label-text font-medium">{item.label}</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        className="input input-bordered input-sm"
                        value={item.value}
                        onChange={handleTimeInputChange(item.setter)}
                      />
                      <span className="text-xs text-base-content/60 pt-1">{item.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="space-y-3">
                  <h4 className="text-md font-bold mb-2">Automatic Start</h4>
                  {toggleOptions.map((option, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        checked={option.checked}
                        onChange={(e) => option.onChange(e.target.checked)}
                      />
                      <span className="label-text">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sound Settings */}
            {activeTab === 'sound' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Sound Settings</h3>

                {/* Focus Music と Break Music をまとめる */}
                {musicSettings.map((setting, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-base-200/30">
                    <h4 className="font-medium mb-3">{setting.label}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label pb-1"><span className="label-text">Type</span></label>
                        <select
                          className="select select-bordered select-sm"
                          value={setting.type}
                          onChange={setting.onTypeChange}
                        >
                          <option value="default">Default Sound</option>
                          <option value="youtube">YouTube URL</option>
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label pb-1">
                          <span className="label-text">
                            {setting.type === 'default' ? 'Sound' : 'YouTube URL'}
                          </span>
                        </label>
                        {setting.type === 'default' ? (
                          <select
                            className="select select-bordered select-sm"
                            value={setting.url}
                            onChange={setting.onUrlChange}
                          >
                            {tickingSounds.map(sound => (
                              <option key={sound} value={`${TICKING_PATH}${sound}`}>
                                {sound.replace('.mp3', '').replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="url"
                            className="input input-bordered input-sm"
                            placeholder="Enter YouTube video URL"
                            value={setting.url}
                            onChange={setting.onUrlChange}
                          />
                        )}
                      </div>
                    </div>
                    <div className="form-control mt-3">
                      <label className="label pb-1"><span className="label-text">Volume</span></label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={setting.volume}
                        className={`range range-${setting.color} range-xs`}
                        onChange={setting.onVolumeChange}
                      />
                      <div className="w-full flex justify-between text-xs px-1">
                        <span>0</span>
                        <span>{setting.volume}</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Alarm Sounds */}
                <div className="p-4 border rounded-lg bg-base-200/30">
                  <h4 className="font-medium mb-3">Alarm Sounds</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {alarmSettings.map((alarm, index) => (
                      <div key={index} className="form-control">
                        <label className="label pb-1"><span className="label-text">{alarm.label}</span></label>
                        <select
                          className="select select-bordered select-sm"
                          value={alarm.value}
                          onChange={alarm.onChange}
                        >
                          {alarmSounds.map(sound => (
                            <option key={sound} value={`${ALARM_PATH}${sound}`}>
                              {sound.replace(/\.(mp3|wav)$/, '').replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Appearance</h3>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${ // Thicker border
                        selectedTheme === theme
                          ? 'border-primary scale-105 shadow-lg' // Enhanced selected style
                          : 'border-base-300 hover:border-base-content/50'
                        }`}
                      data-theme={theme} // Apply theme to preview
                      onClick={() => setSelectedTheme(theme)}
                    >
                      <div className="flex flex-col items-center">
                        {/* More detailed preview */}
                        <div className="w-full h-16 rounded mb-2 p-2 bg-base-100 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <div className="bg-primary h-2 w-1/4 rounded"></div>
                            <div className="bg-secondary h-2 w-1/4 rounded"></div>
                            <div className="bg-accent h-2 w-1/4 rounded"></div>
                          </div>
                          <button className="btn btn-xs btn-primary mt-2 self-start">Button</button>
                        </div>
                        <span className="text-sm capitalize font-medium text-base-content">{theme}</span> {/* Use base-content color */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-action p-4 border-t bg-base-200"> {/* Added background */}
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </dialog>
  );
};
