// components/SettingsModal.tsx
import { useState, useEffect, useRef } from 'react';
import { MusicSetting } from './MusicPlayer'; // MusicSetting 型をインポート

interface SettingsModalProps {
  isOpen: boolean; // このpropは引き続き受け取る
  onClose: () => void; // モーダルを閉じるための関数
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  // App.tsxから音楽設定を受け取るためのpropsを追加
  focusMusic: MusicSetting;
  breakMusic: MusicSetting;
  onSave: (values: { // 保存する値に音楽設定を追加
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    focusMusic: MusicSetting; // 追加
    breakMusic: MusicSetting; // 追加
  }) => void;
}

// テーマリスト（変更なし）
const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter'
];

export const SettingsModal = ({
  isOpen,
  onClose,
  workMinutes: initialWork,
  shortBreakMinutes: initialShort,
  longBreakMinutes: initialLong,
  longBreakInterval: initialInterval,
  focusMusic: initialFocusMusic,
  breakMusic: initialBreakMusic,
  onSave,
}: SettingsModalProps) => {
  // State管理
  const [workMinutes, setWorkMinutes] = useState(initialWork);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(initialShort);
  const [longBreakMinutes, setLongBreakMinutes] = useState(initialLong);
  const [longBreakInterval, setLongBreakInterval] = useState(initialInterval);
  const [focusMusic, setFocusMusic] = useState(initialFocusMusic);
  const [breakMusic, setBreakMusic] = useState(initialBreakMusic);
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    // クライアントサイドでのみlocalStorage/documentElementにアクセス
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // dialog要素への参照を作成
  const modalRef = useRef<HTMLDialogElement>(null);

  // isOpen prop の変更を監視してモーダルを開閉
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      if (isOpen) {
        modalElement.showModal(); // モーダルを開く
      } else {
        modalElement.close(); // モーダルを閉じる
      }
    }
  }, [isOpen]);

  // 保存処理（変更なし）
  const handleSave = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('theme', selectedTheme);
    }
    onSave({ 
      workMinutes, 
      shortBreakMinutes, 
      longBreakMinutes, 
      longBreakInterval,
      focusMusic, // 音楽設定を追加
      breakMusic  // 音楽設定を追加
    });
    // onClose(); // close()メソッドで閉じるので不要になる場合があるが、念のため残す
  };

  // ESCキーで閉じるイベントリスナー（<dialog>がデフォルトで持つが、念のため）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  // if (!isOpen) return null; // <dialog>を使うので不要

  // <dialog>要素を使用し、refとidを設定
  return (
    <dialog id="settings_modal" className="modal" ref={modalRef} onClose={onClose}>
      {/* modal-box は変更なし */}
      <div className="modal-box w-full max-w-md"> {/* 背景色は<dialog>のbackdropが担当 */}
        <form method="dialog"> {/* モーダル内の閉じるボタン用 */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
        </form>
        <h3 className="font-bold text-lg mb-4">Settings</h3>

        {/* フォームコントロール（変更なし） */}
        <div className="form-control mb-2">
          <label className="label"><span className="label-text">Work Duration (minutes)</span></label>
          <input
            type="number"
            className="input input-bordered w-full" // w-fullを追加
            value={workMinutes}
            onChange={(e) => setWorkMinutes(Math.max(1, Number(e.target.value)))} // 1未満にならないように
          />
        </div>

        <div className="form-control mb-2">
          <label className="label"><span className="label-text">Short Break (minutes)</span></label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={shortBreakMinutes}
            onChange={(e) => setShortBreakMinutes(Math.max(1, Number(e.target.value)))}
          />
        </div>

        <div className="form-control mb-2">
          <label className="label"><span className="label-text">Long Break (minutes)</span></label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={longBreakMinutes}
            onChange={(e) => setLongBreakMinutes(Math.max(1, Number(e.target.value)))}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label"><span className="label-text">Pomodoros before Long Break</span></label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={longBreakInterval}
            onChange={(e) => setLongBreakInterval(Math.max(1, Number(e.target.value)))}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label"><span className="label-text">Theme</span></label>
          <select
            className="select select-bordered w-full"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
          >
            {/* テーマ選択肢（変更なし） */}
            {themes.map((theme) => (
              <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* 音楽設定セクションを追加 */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Focus Music Volume</span>
            <span className="label-text-alt">{focusMusic.volume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={focusMusic.volume}
            onChange={(e) => {
              const newVolume = Number(e.target.value);
              setFocusMusic({...focusMusic, volume: newVolume});
            }}
            className="range range-primary range-sm"
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Break Music Volume</span>
            <span className="label-text-alt">{breakMusic.volume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={breakMusic.volume}
            onChange={(e) => {
              const newVolume = Number(e.target.value);
              setBreakMusic({...breakMusic, volume: newVolume});
            }}
            className="range range-primary range-sm"
          />
        </div>

        {/* モーダルアクションボタン */}
        {/* <form method="dialog"> を使っているので、Cancelボタンは不要になるかも */}
        <div className="modal-action">
           <form method="dialog" className='flex gap-2'> {/* formで囲む */}
             {/* Cancelボタンは form method="dialog" で自動的に閉じる */}
             <button className="btn btn-ghost">Cancel</button>
             {/* Saveボタンは onClick で処理 */}
             <button className="btn btn-primary" type="button" onClick={handleSave}>Save</button>
           </form>
        </div>
      </div>
      {/* 背景クリックで閉じるための記述 (daisyUI v4.x) */}
      {/* <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form> */}
       {/* daisyUI v5では <dialog> の backdrop クリックで閉じるのがデフォルトのはず */}
    </dialog>
  );
};
