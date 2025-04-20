import { useState, useEffect } from 'react';
import { FaPlay, FaPause,FaFastForward } from 'react-icons/fa';
import { FiRotateCcw, FiSettings } from 'react-icons/fi';
import { Timer } from './components/Timer';
import { MusicPlayer } from './components/MusicPlayer';
import { SettingsModal } from './components/SettingsModal';

// テーマ名とプレビュー色のマッピング (主要な色を定義)
// 参考: https://github.com/saadeghi/daisyui/blob/master/src/theming/themes.js
// 全てのテーマを定義するのは大変なので、一部のみ定義します。
const themePreviews = [
  { name: "light", p: "#570df8", s: "#f000b8", a: "#37cdbe", n: "#3d4451", b100: "#ffffff" },
  { name: "dark", p: "#661ae6", s: "#d926a9", a: "#1fb2a6", n: "#191d24", b100: "#2a303c" },
  { name: "cupcake", p: "#65c3c8", s: "#ef9fbc", a: "#eeaf3a", n: "#291334", b100: "#faf7f5" },
  { name: "bumblebee", p: "#e0a82e", s: "#f9d72f", a: "#181830", n: "#181830", b100: "#ffffff" },
  { name: "emerald", p: "#66cc8a", s: "#377cfb", a: "#ea5234", n: "#333c4d", b100: "#ffffff" },
  { name: "corporate", p: "#4b6bfb", s: "#7b92b2", a: "#67cba0", n: "#181a2a", b100: "#ffffff" },
  { name: "synthwave", p: "#e779c1", s: "#58c7f3", a: "#f3cc30", n: "#1a103d", b100: "#2d1b69" },
  { name: "retro", p: "#ef9995", s: "#a4c15c", a: "#ffeaa5", n: "#2e282a", b100: "#e4d8b4" },
  { name: "cyberpunk", p: "#ff7598", s: "#75d1f0", a: "#c07eec", n: "#16181d", b100: "#ffffff" },
  { name: "valentine", p: "#e96d7b", s: "#a991f7", a: "#86efac", n: "#2a2e37", b100: "#fafafa" },
  { name: "halloween", p: "#f28c18", s: "#6d3a9c", a: "#51a800", n: "#1b1d1d", b100: "#212121" },
  { name: "garden", p: "#5c7f67", s: "#ecf4e7", a: "#fde68a", n: "#251f17", b100: "#e9e7e7" },
  { name: "forest", p: "#1eb854", s: "#1fd65f", a: "#d99330", n: "#171212", b100: "#171212" }, // Note: Forest dark theme, base-100 is dark
  { name: "aqua", p: "#09ecf3", s: "#966fb3", a: "#ffe999", n: "#345da7", b100: "#ffffff" },
  { name: "lofi", p: "#0d0d0d", s: "#1a1a1a", a: "#262626", n: "#4d4d4d", b100: "#ffffff" }, // Simplified lofi
  { name: "pastel", p: "#d1c1d7", s: "#f6cbd1", a: "#b4e9d6", n: "#a2a2a2", b100: "#ffffff" },
  { name: "fantasy", p: "#6e0b75", s: "#007ebd", a: "#f87272", n: "#1f2937", b100: "#ffffff" },
  { name: "wireframe", p: "#b8b8b8", s: "#b8b8b8", a: "#b8b8b8", n: "#b8b8b8", b100: "#ffffff" },
  { name: "black", p: "#343232", s: "#343232", a: "#343232", n: "#000000", b100: "#000000" },
  { name: "luxury", p: "#ffffff", s: "#152747", a: "#513448", n: "#09090b", b100: "#09090b" }, // Note: Luxury dark theme
  { name: "dracula", p: "#ff79c6", s: "#bd93f9", a: "#ffb86c", n: "#414558", b100: "#282a36" },
  { name: "cmyk", p: "#45aeee", s: "#e8488a", a: "#fcd12a", n: "#1a1a1a", b100: "#ffffff" },
  { name: "autumn", p: "#8c0327", s: "#d85251", a: "#d59b6a", n: "#302121", b100: "#f1f1f1" },
  { name: "business", p: "#1c4e80", s: "#7c909a", a: "#ea6947", n: "#202020", b100: "#ffffff" },
  { name: "acid", p: "#ff00f4", s: "#ff7400", a: "#35ff69", n: "#161717", b100: "#fafafa" },
  { name: "lemonade", p: "#519903", s: "#e9e92f", a: "#facc15", n: "#1f2937", b100: "#ffffff" },
  { name: "night", p: "#3b82f6", s: "#8b5cf6", a: "#f471b5", n: "#1e293b", b100: "#0f172a" },
  { name: "coffee", p: "#db924b", s: "#263e3f", a: "#dc2626", n: "#20161f", b100: "#2d1f21" }, // Note: Coffee dark theme
  { name: "winter", p: "#047aff", s: "#463aa1", a: "#c149ad", n: "#1e293b", b100: "#ffffff" },
];

export const App = () => {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const modes = {
    work: { label: 'Focus', duration: workMinutes * 60 },
    shortBreak: { label: 'Short Break', duration: shortBreakMinutes * 60 },
    longBreak: { label: 'Long Break', duration: longBreakMinutes * 60 },
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    document.title = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')} - Pomodoro Timer`;
  }, [timeLeft]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          handleAutoSwitch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleAutoSwitch = () => {
    if (mode === 'work') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      if (newCount % longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakMinutes * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakMinutes * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(workMinutes * 60);
    }
  };

  const handleModeChange = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsRunning(false);
  };

  const handleSaveSettings = ({
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    longBreakInterval,
  }: {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
  }) => {
    setWorkMinutes(workMinutes);
    setShortBreakMinutes(shortBreakMinutes);
    setLongBreakMinutes(longBreakMinutes);
    setLongBreakInterval(longBreakInterval);
    // 時間を再設定（現在のモードに基づく）
    setTimeLeft(modes[mode].duration);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* ナビゲーションバー */}
        <div className="navbar bg-base-100 rounded-box shadow-lg mb-8">
          <div className="flex-1 flex items-center">
            <img src="public/favicon.svg" alt="logo" className='w-5 h-5 cursor-pointer' onClick={() => window.location.reload()} />
            <span className="px-2 text-xl cursor-pointer" onClick={() => window.location.reload()}>Pomodoro Method Timer</span>
          </div>
          <div className="flex-none">
            <button onClick={() => setShowSettings(true)} className="btn btn-ghost btn-circle" title="Settings">
              <FiSettings size={20} />
            </button>
          </div>
        </div>

        {/* タイマーカード */}
        <div className="card bg-base-100 shadow-xl p-8 mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(modes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleModeChange(key as keyof typeof modes)}
                className={`btn ${mode === key ? 'btn-error' : 'btn-outline'} w-20 sm:w-40`}
              >
                {value.label}
              </button>
            ))}
          </div>

          <Timer timeLeft={timeLeft} />

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn btn-circle btn-lg btn-outline"
            >
              {isRunning ? <FaPause size={24} /> : <FaPlay size={24} />}
            </button>
            <button
              onClick={() => {
                setTimeLeft(modes[mode].duration);
                setIsRunning(false);
              }}
              className="btn btn-circle btn-lg btn-outline"
            >
              <FiRotateCcw size={24} />
            </button>
            <button
              onClick={() => {
                handleAutoSwitch();
                setIsRunning(false);
              }}
              className="btn btn-circle btn-lg btn-outline"
            >
              <FaFastForward size={24} />
            </button>
          </div>
        </div>

        <MusicPlayer isMuted={isMuted} setIsMuted={setIsMuted} shouldPlay={isRunning} mode={mode} />
      </div>

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        workMinutes={workMinutes}
        shortBreakMinutes={shortBreakMinutes}
        longBreakMinutes={longBreakMinutes}
        longBreakInterval={longBreakInterval}
      />
    </div>
  );
};
