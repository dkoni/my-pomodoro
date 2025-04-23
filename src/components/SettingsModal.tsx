import { useState, useEffect, ChangeEvent } from 'react'; // Added ChangeEvent
import { MusicSetting } from './MusicPlayer';

interface Task { // This interface seems unused here, consider removing if not needed later
  id: string;
  text: string;
  completed: boolean;
}

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
  focusMusic: initialFocusMusic, // Use initial props
  breakMusic: initialBreakMusic,
  workAlarm: initialWorkAlarm,
  shortBreakAlarm: initialShortBreakAlarm,
  longBreakAlarm: initialLongBreakAlarm,
  tickingSounds,
  alarmSounds,
  currentTheme // Use initial theme
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState('timer');
  // Timer State
  const [workMinutes, setWorkMinutes] = useState(initialWork);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(initialShort);
  const [longBreakMinutes, setLongBreakMinutes] = useState(initialLong);
  const [longBreakInterval, setLongBreakInterval] = useState(initialInterval);
  const [autoStartBreaks, setAutoStartBreaks] = useState(() => localStorage.getItem('autoStartBreaks') === 'true'); // Load from localStorage
  const [autoStartWork, setAutoStartWork] = useState(() => localStorage.getItem('autoStartWork') === 'true'); // Load from localStorage

  // Sound State
  const [focusMusicSetting, setFocusMusicSetting] = useState<MusicSetting>(initialFocusMusic);
  const [breakMusicSetting, setBreakMusicSetting] = useState<MusicSetting>(initialBreakMusic);
  const [workAlarm, setWorkAlarm] = useState(initialWorkAlarm);
  const [shortBreakAlarm, setShortBreakAlarm] = useState(initialShortBreakAlarm);
  const [longBreakAlarm, setLongBreakAlarm] = useState(initialLongBreakAlarm);

  // Appearance State
  const [selectedTheme, setSelectedTheme] = useState(currentTheme); // Initialize with current theme

  // Task State (Seems unused in modal, maybe remove?)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Load auto start settings from localStorage on mount
  useEffect(() => {
    setAutoStartBreaks(localStorage.getItem('autoStartBreaks') === 'true');
    setAutoStartWork(localStorage.getItem('autoStartWork') === 'true');
    setSelectedTheme(localStorage.getItem('theme') || 'light'); // Load theme
  }, []);


  const handleSave = () => {
    // Save auto start settings to localStorage
    localStorage.setItem('autoStartBreaks', String(autoStartBreaks));
    localStorage.setItem('autoStartWork', String(autoStartWork));
    localStorage.setItem('theme', selectedTheme); // Save theme

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


  // --- Task Handlers (Seems unused, maybe remove?) ---
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now().toString(),
        text: newTask,
        completed: false
      }]);
      setNewTask('');
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? {...task, completed: !task.completed} : task
    ));
  };

  const updateTask = (id: string, newText: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? {...task, text: newText} : task
    ));
  };

  return (
    <dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box max-w-2xl p-0">
        <div className="flex">
          {/* タブナビゲーション */}
          <div className="w-48 bg-base-200 p-4">
            <ul className="menu space-y-1">
              <li>
                <a className={`flex items-center gap-2 ${activeTab === 'timer' ? 'active' : ''}`}
                   onClick={() => setActiveTab('timer')}>
                  ⏱️ Timer
                </a>
              </li>
               <li>
                <a className={`flex items-center gap-2 ${activeTab === 'sound' ? 'active' : ''}`}
                   onClick={() => setActiveTab('sound')}>
                  🎵 Sound
                </a>
              </li>
              {/* <li> // Task tab removed for now as it seems unused in modal
                <a className={`flex items-center gap-2 ${activeTab === 'tasks' ? 'active' : ''}`}
                   onClick={() => setActiveTab('tasks')}>
                  📝 Tasks
                </a>
              </li> */}
              <li>
                <a className={`flex items-center gap-2 ${activeTab === 'appearance' ? 'active' : ''}`}
                   onClick={() => setActiveTab('appearance')}>
                  🎨 Appearance
                </a>
              </li>
            </ul>
          </div>

          {/* コンテンツエリア */}
          <div className="flex-1 p-6 max-h-[70vh] overflow-y-auto">
            {/* Timer Settings */}
            {activeTab === 'timer' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Timer Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"> {/* Adjusted grid layout */}
                  <div className="form-control">
                    <label className="label pb-1"> {/* Reduced bottom padding */}
                      <span className="label-text font-medium">Work Duration</span>
                    </label>
                    <input
                      type="number"
                      min="1" // Add min value
                      className="input input-bordered input-sm" // Smaller input
                      value={workMinutes}
                      onChange={(e) => setWorkMinutes(Math.max(1, Number(e.target.value)))}
                    />
                     <span className="text-xs text-base-content/60 pt-1">minutes</span>
                  </div>
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium">Short Break</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered input-sm"
                      value={shortBreakMinutes}
                      onChange={(e) => setShortBreakMinutes(Math.max(1, Number(e.target.value)))}
                    />
                     <span className="text-xs text-base-content/60 pt-1">minutes</span>
                  </div>
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium">Long Break</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered input-sm"
                      value={longBreakMinutes}
                      onChange={(e) => setLongBreakMinutes(Math.max(1, Number(e.target.value)))}
                    />
                     <span className="text-xs text-base-content/60 pt-1">minutes</span>
                  </div>
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium">Long Break Interval</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered input-sm"
                      value={longBreakInterval}
                      onChange={(e) => setLongBreakInterval(Math.max(1, Number(e.target.value)))}
                    />
                     <span className="text-xs text-base-content/60 pt-1">pomodoros</span>
                  </div>
                </div>

                <div className="divider"></div> {/* Divider */}

                <div className="space-y-3"> {/* Increased spacing */}
                   <h4 className="font-medium mb-2">Automatic Start</h4>
                   <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-sm"
                      checked={autoStartBreaks}
                      onChange={(e) => setAutoStartBreaks(e.target.checked)}
                    />
                    <span className="label-text">Auto Start Breaks</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-sm"
                      checked={autoStartWork}
                      onChange={(e) => setAutoStartWork(e.target.checked)}
                    />
                    <span className="label-text">Auto Start Focus Sessions</span>
                  </label>
                </div>
              </div>
            )}

            {/* Sound Settings */}
            {activeTab === 'sound' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Sound Settings</h3>

                {/* Focus Music */}
                <div className="p-4 border rounded-lg bg-base-200/30">
                  <h4 className="font-medium mb-3">Focus Music</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-1"><span className="label-text">Type</span></label>
                      <select
                        className="select select-bordered select-sm"
                        value={focusMusicSetting.type}
                        onChange={(e) => handleMusicTypeChange('focus', e)}
                      >
                        <option value="default">Default Sound</option>
                        <option value="youtube">YouTube URL</option>
                      </select>
                    </div>
                    <div className="form-control">
                       <label className="label pb-1">
                         <span className="label-text">
                           {focusMusicSetting.type === 'default' ? 'Sound' : 'YouTube URL'}
                         </span>
                       </label>
                      {focusMusicSetting.type === 'default' ? (
                        <select
                          className="select select-bordered select-sm"
                          value={focusMusicSetting.url}
                          onChange={(e) => handleMusicUrlChange('focus', e)}
                        >
                          {tickingSounds.map(sound => (
                            <option key={sound} value={`${TICKING_PATH}${sound}`}>{sound.replace('.mp3', '').replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="url"
                          className="input input-bordered input-sm"
                          placeholder="Enter YouTube video URL"
                          value={focusMusicSetting.url}
                          onChange={(e) => handleMusicUrlChange('focus', e)}
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
                        value={focusMusicSetting.volume}
                        className="range range-primary range-xs"
                        onChange={(e) => handleVolumeChange('focus', e)}
                      />
                      <div className="w-full flex justify-between text-xs px-1">
                        <span>0</span>
                        <span>{focusMusicSetting.volume}</span>
                        <span>100</span>
                      </div>
                    </div>
                </div>

                 {/* Break Music */}
                <div className="p-4 border rounded-lg bg-base-200/30">
                  <h4 className="font-medium mb-3">Break Music</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-1"><span className="label-text">Type</span></label>
                      <select
                        className="select select-bordered select-sm"
                        value={breakMusicSetting.type}
                        onChange={(e) => handleMusicTypeChange('break', e)}
                      >
                        <option value="default">Default Sound</option>
                        <option value="youtube">YouTube URL</option>
                      </select>
                    </div>
                    <div className="form-control">
                       <label className="label pb-1">
                         <span className="label-text">
                           {breakMusicSetting.type === 'default' ? 'Sound' : 'YouTube URL'}
                         </span>
                       </label>
                      {breakMusicSetting.type === 'default' ? (
                        <select
                          className="select select-bordered select-sm"
                          value={breakMusicSetting.url}
                          onChange={(e) => handleMusicUrlChange('break', e)}
                        >
                          {tickingSounds.map(sound => (
                            <option key={sound} value={`${TICKING_PATH}${sound}`}>{sound.replace('.mp3', '').replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="url"
                          className="input input-bordered input-sm"
                          placeholder="Enter YouTube video URL"
                          value={breakMusicSetting.url}
                          onChange={(e) => handleMusicUrlChange('break', e)}
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
                        value={breakMusicSetting.volume}
                        className="range range-secondary range-xs" // Use secondary color for break
                        onChange={(e) => handleVolumeChange('break', e)}
                      />
                      <div className="w-full flex justify-between text-xs px-1">
                        <span>0</span>
                        <span>{breakMusicSetting.volume}</span>
                        <span>100</span>
                      </div>
                    </div>
                </div>

                {/* Alarm Sounds */}
                 <div className="p-4 border rounded-lg bg-base-200/30">
                   <h4 className="font-medium mb-3">Alarm Sounds</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="form-control">
                       <label className="label pb-1"><span className="label-text">End of Focus</span></label>
                       <select
                         className="select select-bordered select-sm"
                         value={workAlarm}
                         onChange={(e) => setWorkAlarm(e.target.value)}
                       >
                         {alarmSounds.map(sound => (
                           <option key={sound} value={`${ALARM_PATH}${sound}`}>{sound.replace(/\.(mp3|wav)$/, '').replace(/_/g, ' ')}</option>
                         ))}
                       </select>
                     </div>
                     <div className="form-control">
                       <label className="label pb-1"><span className="label-text">End of Short Break</span></label>
                       <select
                         className="select select-bordered select-sm"
                         value={shortBreakAlarm}
                         onChange={(e) => setShortBreakAlarm(e.target.value)}
                       >
                         {alarmSounds.map(sound => (
                           <option key={sound} value={`${ALARM_PATH}${sound}`}>{sound.replace(/\.(mp3|wav)$/, '').replace(/_/g, ' ')}</option>
                         ))}
                       </select>
                     </div>
                     <div className="form-control">
                       <label className="label pb-1"><span className="label-text">End of Long Break</span></label>
                       <select
                         className="select select-bordered select-sm"
                         value={longBreakAlarm}
                         onChange={(e) => setLongBreakAlarm(e.target.value)}
                       >
                         {alarmSounds.map(sound => (
                           <option key={sound} value={`${ALARM_PATH}${sound}`}>{sound.replace(/\.(mp3|wav)$/, '').replace(/_/g, ' ')}</option>
                         ))}
                       </select>
                     </div>
                   </div>
                 </div>
              </div>
            )}

            {/* Task Management (Removed for now) */}
            {/* {activeTab === 'tasks' && ( ... )} */}

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
