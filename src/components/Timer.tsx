// App から渡される props の型を定義
interface TimerProps {
  timeLeft: number; // 残り時間（秒単位）
}

// 残り時間を「分:秒」の形式で表示するシンプルなタイマー
export const Timer = ({ timeLeft }: TimerProps) => {
  // 分と秒を計算
  const minutes = Math.floor(timeLeft / 60); // 例: 1500秒 → 25分
  const seconds = timeLeft % 60;             // 残りの秒（60で割った余り）

  return (
    // <div className="text-center">
    <div className="w-full flex justify-center">
      {/* 数字を大きく中央に表示する。daisyUI のテーマカラーに合わせたテキスト色も適用される */}
      <div className="text-8xl sm:text-9xl font-bold tracking-widest text-base-content">
        {/* 例: 05:00 のように2桁表示を維持 */}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

// 🧭 まとめ：daisyUIだけの代表的クラスはこれ！
// 	•	btn, card, navbar, dropdown, menu, tabs, alert, modal などの部品系
// 	•	bg-base-*, text-base-content などの自動テーマ調整系
