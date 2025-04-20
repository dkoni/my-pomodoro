import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { FiMusic, FiVolume2, FiVolumeX, FiYoutube, FiDisc } from 'react-icons/fi'; // アイコン追加

// 音楽設定の型
export interface MusicSetting {
  type: 'default' | 'youtube';
  url: string; // defaultの場合はファイルパス、youtubeの場合はYouTube URL
  volume: number; // 0 to 100
}

// 親コンポーネントから受け取るprops
interface MusicPlayerProps {
  mode: 'work' | 'shortBreak' | 'longBreak'; // 現在のタイマーモード
  shouldPlay: boolean; // 再生すべきかどうかのフラグ
  focusMusic: MusicSetting; // 作業中の音楽設定
  breakMusic: MusicSetting; // 休憩中の音楽設定
  onFocusMusicChange: (setting: MusicSetting) => void; // 作業中音楽設定の更新関数
  onBreakMusicChange: (setting: MusicSetting) => void; // 休憩中音楽設定の更新関数
}

// YouTube URLからVideo IDを抽出するヘルパー関数
const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
  } catch (e) {
    // 無効なURLの場合
    console.error("Invalid YouTube URL:", url, e);
  }
  return null;
};

// デフォルト音源のパス（仮） - 必要に応じてApp.tsxから渡すように変更も可能
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
  // 現在のモードに応じた音楽設定と更新関数を選択
  const isWorkMode = mode === 'work';
  const currentMusicSetting = isWorkMode ? focusMusic : breakMusic;
  const onCurrentMusicChange = isWorkMode ? onFocusMusicChange : onBreakMusicChange;

  // ローカルステートでUIを管理（propsの値を初期値とする）
  const [musicType, setMusicType] = useState(currentMusicSetting.type);
  const [youtubeUrl, setYoutubeUrl] = useState(currentMusicSetting.type === 'youtube' ? currentMusicSetting.url : '');
  const [volume, setVolume] = useState(currentMusicSetting.volume);
  const [isMuted, setIsMuted] = useState(false); // ミュート状態

  // YouTubeプレイヤーの参照
  const playerRef = useRef<any>(null); // react-youtubeの型定義が完全でないためanyを使用
  // Audio要素の参照
  const audioRef = useRef<HTMLAudioElement>(null);

  // 現在再生中のYouTube Video ID
  const currentVideoId = musicType === 'youtube' ? getYouTubeVideoId(youtubeUrl) : null;
  // 現在再生中のデフォルト音源パス
  const currentDefaultAudioSrc = isWorkMode ? defaultFocusSound : defaultBreakSound;

  // モードが変更されたら、UIの表示を現在の設定に合わせる
  useEffect(() => {
    setMusicType(currentMusicSetting.type);
    setYoutubeUrl(currentMusicSetting.type === 'youtube' ? currentMusicSetting.url : '');
    setVolume(currentMusicSetting.volume);
    
    // localStorageに保存
    if (currentMusicSetting.type === 'youtube' && currentMusicSetting.url) {
      localStorage.setItem(
        isWorkMode ? 'focusMusicUrl' : 'breakMusicUrl',
        currentMusicSetting.url
      );
    }
  }, [currentMusicSetting, isWorkMode]);

  // 初期化時にlocalStorageからURLを読み込む
  useEffect(() => {
    const savedUrl = localStorage.getItem(
      isWorkMode ? 'focusMusicUrl' : 'breakMusicUrl'
    );
    if (savedUrl && musicType === 'youtube') {
      setYoutubeUrl(savedUrl);
      onCurrentMusicChange({ ...currentMusicSetting, url: savedUrl });
    }
  }, [isWorkMode]);

  // 再生/停止の制御
  useEffect(() => {
    // YouTube Player
    const ytPlayer = playerRef.current;
    if (musicType === 'youtube' && ytPlayer && currentVideoId) {
      if (shouldPlay && !isMuted) {
        ytPlayer.playVideo();
      } else {
        ytPlayer.pauseVideo();
      }
    }

    // Default Audio Player
    const audioElement = audioRef.current;
    if (musicType === 'default' && audioElement) {
      if (shouldPlay && !isMuted) {
        audioElement.play().catch((err) => console.warn('Autoplay blocked:', err));
      } else {
        audioElement.pause();
      }
    }
  }, [shouldPlay, isMuted, musicType, currentVideoId]); // currentVideoIdも依存配列に追加

  // 音量制御
  useEffect(() => {
    // YouTube Player
    const ytPlayer = playerRef.current;
    if (musicType === 'youtube' && ytPlayer) {
      ytPlayer.setVolume(isMuted ? 0 : volume);
    }

    // Default Audio Player
    const audioElement = audioRef.current;
    if (musicType === 'default' && audioElement) {
      audioElement.volume = isMuted ? 0 : volume / 100; // HTML Audioは0-1の範囲
    }
  }, [volume, isMuted, musicType]);

  // --- UIイベントハンドラ ---

  // 音源タイプ変更
  const handleTypeChange = (newType: 'default' | 'youtube') => {
    setMusicType(newType);
    // 親コンポーネントに変更を通知
    onCurrentMusicChange({
      ...currentMusicSetting,
      type: newType,
      // URLはYouTube選択時のみ保持、Default選択時はクリアしても良いかも
      url: newType === 'youtube' ? youtubeUrl : '',
    });
    // タイプ変更時に再生を一旦停止
    playerRef.current?.pauseVideo();
    audioRef.current?.pause();
  };

  // YouTube URL変更
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setYoutubeUrl(newUrl);
    // 即時反映せず、フォーカスが外れた時やEnterキーで保存する方が良いかも？
    // ここでは簡単のため即時反映
    onCurrentMusicChange({ ...currentMusicSetting, type: 'youtube', url: newUrl });
  };

  // 音量変更
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    onCurrentMusicChange({ ...currentMusicSetting, volume: newVolume });
  };

  // ミュート切り替え
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // ミュート状態は永続化せず、このコンポーネント内でのみ管理
  };

  // YouTube Playerの準備完了時
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    // 初期音量を設定
    playerRef.current.setVolume(isMuted ? 0 : volume);
    // 再生状態を反映
    if (shouldPlay && !isMuted) {
      playerRef.current.playVideo();
    }
  };

  // YouTube Playerのエラーハンドリング
  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
    // エラー発生時（例：動画が見つからない）にデフォルトに戻すなどの処理も可能
  };


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
            {/* YouTube Player (非表示で埋め込む) */}
            {currentVideoId && (
              <div className="mt-2" style={{ height: 0, overflow: 'hidden' }}>
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
                  key={currentVideoId}
                />
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
             src={currentDefaultAudioSrc}
             loop
             preload="auto"
             onVolumeChange={(e) => console.log("Audio Volume:", (e.target as HTMLAudioElement).volume)} // デバッグ用
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
            disabled={isMuted} // ミュート中は無効化
          />
        </div>
      </div>
    </div>
  );
};
