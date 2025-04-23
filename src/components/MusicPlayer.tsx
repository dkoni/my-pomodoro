import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube';
import { FiMusic, FiVolume2, FiVolumeX, FiYoutube, FiDisc } from 'react-icons/fi';
import ErrorBoundary from './ErrorBoundary';

export interface MusicSetting {
  type: 'default' | 'youtube';
  url: string;
  volume: number;
}

interface MusicPlayerProps {
  mode: 'work' | 'shortBreak' | 'longBreak';
  shouldPlay: boolean;
  focusMusic: MusicSetting;
  breakMusic: MusicSetting;
  onFocusMusicChange: (setting: MusicSetting) => void;
  onBreakMusicChange: (setting: MusicSetting) => void;
}

const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
    if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v');
  } catch (e) {
    console.error("Invalid YouTube URL:", url, e);
  }
  return null;
};

const defaultFocusSound = '/sounds/lofi.mp3';
const defaultBreakSound = '/sounds/nature.mp3';

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  mode,
  shouldPlay,
  focusMusic,
  breakMusic,
  onFocusMusicChange,
  onBreakMusicChange,
}) => {
  const isWorkMode = mode === 'work';
  const currentMusicSetting = isWorkMode ? focusMusic : breakMusic;
  const onCurrentMusicChange = isWorkMode ? onFocusMusicChange : onBreakMusicChange;

  const [musicType, setMusicType] = useState(currentMusicSetting.type);
  const [youtubeUrl, setYoutubeUrl] = useState(currentMusicSetting.type === 'youtube' ? currentMusicSetting.url : '');
  const [volume, setVolume] = useState(currentMusicSetting.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<YouTube | null>(null);
  const playerInstanceRef = useRef<{
    playVideo: () => void;
    pauseVideo: () => void;
    setVolume: (volume: number) => void;
    destroy: () => void;
    mute: () => void;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentVideoId = musicType === 'youtube' ? getYouTubeVideoId(youtubeUrl) : null;
  const currentDefaultAudioSrc = isWorkMode ? defaultFocusSound : defaultBreakSound;

  // プレイヤーのクリーンアップ
  const cleanupPlayer = () => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (err) {
        console.error('Failed to destroy player:', err);
      }
      playerInstanceRef.current = null;
      setPlayerReady(false);
    }
  };

  // URL変更時にプレイヤーをリセット
  useEffect(() => {
    return cleanupPlayer;
  }, [currentVideoId]);

  // モード変更時の処理
  useEffect(() => {
    setMusicType(currentMusicSetting.type);
    setYoutubeUrl(currentMusicSetting.type === 'youtube' ? currentMusicSetting.url : '');
    setVolume(currentMusicSetting.volume);
  }, [currentMusicSetting]);

  // 再生/停止制御
  useEffect(() => {
    // YouTube Player
    if (musicType === 'youtube' && playerInstanceRef.current && playerReady) {
      try {
        if (shouldPlay && !isMuted) {
          playerInstanceRef.current.playVideo();
        } else {
          playerInstanceRef.current.pauseVideo();
        }
      } catch (err) {
        console.error('Playback control error:', err);
      }
    }

    // Default Audio Player
    if (musicType === 'default' && audioRef.current) {
      if (shouldPlay && !isMuted) {
        // srcが変更された場合、ロードし直してから再生
        if (audioRef.current.currentSrc !== currentDefaultAudioSrc) {
          audioRef.current.load(); // load()を呼ぶと自動で再生される場合があるため注意
        }
        audioRef.current.play().catch((err: Error) => console.warn('Autoplay blocked:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [shouldPlay, isMuted, musicType, currentVideoId, playerReady, currentDefaultAudioSrc]); // currentDefaultAudioSrc を依存配列に追加

  // 音量制御
  useEffect(() => {
    // YouTube Player
    if (musicType === 'youtube' && playerInstanceRef.current && playerReady) {
      try {
        playerInstanceRef.current.setVolume(isMuted ? 0 : volume);
      } catch (err) {
        console.error('Volume control error:', err);
      }
    }

    // Default Audio Player
    if (musicType === 'default' && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted, musicType, playerReady]);

  // プレイヤー準備完了
  const onPlayerReady = (event: YouTubeEvent) => {
    try {
      playerInstanceRef.current = {
        playVideo: () => event.target.playVideo(),
        pauseVideo: () => event.target.pauseVideo(),
        setVolume: (vol: number) => event.target.setVolume(vol),
        destroy: () => event.target.destroy(),
        mute: () => event.target.mute()
      };
      
      event.target.setVolume(isMuted ? 0 : volume);
      setPlayerReady(true);
      
      if (shouldPlay && !isMuted) {
        event.target.playVideo().catch((err: Error) => {
          console.error('Play failed, trying muted:', err);
          event.target.mute();
          event.target.playVideo();
        });
      }
    } catch (err) {
      console.error('Player ready error:', err);
      setPlayerReady(false);
    }
  };

  // プレイヤーエラー処理
  const onPlayerError = (event: YouTubeEvent) => {
    console.error('YouTube Player Error:', event.data);
    cleanupPlayer();
    // デフォルト音源にフォールバック
    setMusicType('default');
    onCurrentMusicChange({
      ...currentMusicSetting,
      type: 'default',
      url: currentDefaultAudioSrc
    });
  };

  // URL変更処理（即時保存）
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setYoutubeUrl(newUrl);
    cleanupPlayer();
    // 変更を即時保存し、音量も保持
    onCurrentMusicChange({ 
      ...currentMusicSetting, 
      type: 'youtube', 
      url: newUrl,
      volume: volume
    });
  };

  // その他のハンドラ...
  const handleTypeChange = (newType: 'default' | 'youtube') => {
    const newUrl = newType === 'youtube' 
      ? currentMusicSetting.url  // 保存済みURLを使用
      : currentDefaultAudioSrc;

    setMusicType(newType);
    setYoutubeUrl(newType === 'youtube' ? currentMusicSetting.url : '');
    
    onCurrentMusicChange({ 
      ...currentMusicSetting,
      type: newType,
      url: newUrl,
      volume: volume
    });

    cleanupPlayer();
    
    // デフォルトに切り替える場合のみオーディオを停止
    if (newType === 'default') {
      audioRef.current?.pause();
      audioRef.current && (audioRef.current.currentTime = 0);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    onCurrentMusicChange({ ...currentMusicSetting, volume: newVolume });
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* ヘッダー - YouTubeを強調 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiYoutube size={24} className="text-red-500" />
            <h2 className="card-title text-lg">
              {isWorkMode ? 'Focus Music' : 'Break Music'} 
              <span className="text-sm font-normal ml-2">- You can use audio from YouTube.</span>
            </h2>
          </div>
          {/* ミュートボタン */}
          <button 
            onClick={toggleMute} 
            className="btn btn-ghost btn-circle tooltip" 
            data-tip={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          </button>
        </div>

        {/* 音源タイプ選択 - YouTubeをデフォルトに */}
        <div className="form-control mb-4">
          <div className="flex gap-4">
            <label className="label cursor-pointer flex-1">
              <span className="label-text flex items-center gap-2">
                <FiYoutube className="text-red-500" /> YouTube
              </span>
              <input
                type="radio"
                name={`musicType-${mode}`}
                className="radio radio-primary"
                checked={musicType === 'youtube'}
                onChange={() => handleTypeChange('youtube')}
              />
            </label>
            <label className="label cursor-pointer flex-1">
              <span className="label-text flex items-center gap-2">
                <FiDisc /> Default
              </span>
              <input
                type="radio"
                name={`musicType-${mode}`}
                className="radio radio-primary"
                checked={musicType === 'default'}
                onChange={() => handleTypeChange('default')}
              />
            </label>
          </div>
        </div>

        {/* YouTube URL入力 (YouTube選択時のみ表示) */}
        {musicType === 'youtube' && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">YouTube URL</span>
              <span className="label-text-alt">
                <button 
                  className="link link-primary text-xs"
                  onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=jfKfPfyJRdk')}
                >
                  Use Example
                </button>
              </span>
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="input input-bordered w-full"
              value={youtubeUrl}
              onChange={handleUrlChange}
              onBlur={() => {
                if (youtubeUrl) {
                  onCurrentMusicChange({ ...currentMusicSetting, type: 'youtube', url: youtubeUrl });
                }
              }}
            />
            {/* YouTube Player部分 */}
            {currentVideoId && (
              <div className="mt-2" style={{ height: 0, overflow: 'hidden' }}>
                <ErrorBoundary fallback={<p className="text-error text-xs">Failed to load YouTube player.</p>}>
                  <YouTube
                    videoId={currentVideoId}
                    opts={{
                      height: '0',
                      width: '0',
                      playerVars: {
                        autoplay: shouldPlay ? 1 : 0,
                        controls: 0,
                        mute: isMuted ? 1 : 0
                      }
                    }}
                    onReady={onPlayerReady}
                    onError={onPlayerError}
                  />
                </ErrorBoundary>
              </div>
            )}
            {!currentVideoId && youtubeUrl && (
              <p className="text-error text-xs mt-1">Enter a valid YouTube video link.</p>
            )}
            <div className="text-xs mt-1 text-gray-500">
              Example: https://www.youtube.com/watch?v=jfKfPfyJRdk
            </div>
          </div>
        )}

        {/* デフォルト音源 (Default選択時のみ) */}
        {musicType === 'default' && (
          <audio
            ref={audioRef}
            src={currentDefaultAudioSrc} // srcを動的に設定
            loop
            preload="auto"
            // 再生可能になったら再生状態を反映 (autoplayがブロックされる場合があるため)
            onCanPlay={() => {
              if (shouldPlay && !isMuted && musicType === 'default') {
                 audioRef.current?.play().catch((err: Error) => console.warn('Autoplay blocked onCanPlay:', err));
              }
            }}
          />
        )}

        {/* 音量スライダー */}
        <div className="form-control">
          <label className="label mr-1.5">
            <span className="label-text">Volume</span>
            <span className="label-text-alt">{volume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="range range-primary range-sm"
            disabled={isMuted}
          />
        </div>
      </div>
    </div>
  );
};
