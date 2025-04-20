import { useEffect, useRef, useState } from 'react';
import { FiMusic, FiVolume2, FiVolumeX } from 'react-icons/fi';

// 親コンポーネントから受け取るprops
interface MusicPlayerProps {
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  shouldPlay: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak';
}

export const MusicPlayer = ({
  isMuted,
  setIsMuted,
  shouldPlay,
  mode,
}: MusicPlayerProps) => {
  const [selectedTrack, setSelectedTrack] = useState('lofi');
  const audioRef = useRef<HTMLAudioElement>(null);

  // モードに応じて曲を変えたい場合はここで分岐してもOK（今回は同じ）
  const tracks: { [key: string]: string } = {
    lofi: '/sounds/lofi.mp3',
    nature: '/sounds/nature.mp3',
    piano: '/sounds/piano.mp3',
  };

  // 自動再生・停止の制御
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (shouldPlay && !isMuted) {
      audio.play().catch((err) => console.warn('Autoplay blocked:', err));
    } else {
      audio.pause();
    }
  }, [shouldPlay, isMuted, selectedTrack]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiMusic size={20} />
            <h2 className="card-title">Background Music</h2>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="btn btn-ghost btn-circle"
          >
            {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          </button>
        </div>

        {/* トラック選択 */}
        <div className="btn-group mb-4">
          {Object.keys(tracks).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTrack(key)}
              className={`btn ${selectedTrack === key ? 'btn-primary' : 'btn-outline'}`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {/* 再生用のaudioタグ */}
        <audio
          ref={audioRef}
          src={tracks[selectedTrack]}
          loop
          preload="auto"
        />
      </div>
    </div>
  );
};