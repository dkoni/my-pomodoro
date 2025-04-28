// ErrorBoundaryは特定のコンポーネントで予期せぬエラーが発生しても、アプリケーション全体が停止するのを防ぎ、代わりにユーザーフレンドリーなメッセージを表示するための「エラー監視・代替表示コンポーネント」
import { Component, ErrorInfo, ReactNode } from 'react';

// props（親からもらうデータ）の型定義
interface Props {
    children: ReactNode; // 包み込むコンポーネント（子要素）
    fallback?: ReactNode; // エラーが出た時に見せる特別な画面（オプション）
}

// コンポーネント内部で使うstateの型定義
interface State {
    hasError: boolean; // エラーが起きたかどうか
    error?: Error;     // 実際に起きたエラー（開発用）
}

// ErrorBoundaryという名前のクラスコンポーネントを定義
// staticはインスタンスを作る必要なく使用できる
export const ErrorBoundary = class extends Component<Props, State> {
    // 初期のstate（エラーは起きてない）
    public state: State = {
        hasError: false,
    };

    // 子コンポーネントでエラーが発生した時に呼ばれる特別なメソッド
    public static getDerivedStateFromError(error: Error): State {
        // hasErrorをtrueにする → fallbackを表示させる
        return { hasError: true, error };
    }

    // 実際にエラーが発生した時にログを出したりできる（ここではconsoleに出してるだけ）
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    // コンポーネントの見た目を作るメソッド
    public render() {
        if (this.state.hasError) {
            // エラーが起きた時の表示
            return this.props.fallback || (
                <div className="text-error p-4 border border-error rounded">
                    <p>Something went wrong with this component.</p>
                    {/* 開発環境だけエラー詳細を表示する（import.meta.env.DEVはviteで開発モードかどうかの判定） */}
                    {import.meta.env.DEV && this.state.error && (
                        <pre className="text-xs mt-2">{this.state.error.toString()}</pre>
                    )}
                </div>
            );
        }

        // エラーがないなら普通に子コンポーネントを表示
        return this.props.children;
    }
};

/*
Component	クラスコンポーネントの親クラス
ErrorInfo	エラーの情報を持つ型
ReactNode	画面に描画できるもの全般の型(タグ、文字、コンポーネントなど全て描画可能)
*/