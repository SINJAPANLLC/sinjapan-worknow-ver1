import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-900 text-white mt-auto hidden md:block">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-primary-soft bg-clip-text text-transparent mb-4">
              WORK NOW
            </h3>
            <p className="text-neutral-400 text-sm">
              即戦力マッチング&報酬プラットフォーム
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">ワーカー</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/jobs" className="hover:text-primary-400 transition-colors">
                  求人を探す
                </Link>
              </li>
              <li>
                <Link to="/register/worker" className="hover:text-primary-400 transition-colors">
                  ワーカー登録
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">クライアント</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/post-job" className="hover:text-primary-400 transition-colors">
                  求人を投稿
                </Link>
              </li>
              <li>
                <Link to="/register/client" className="hover:text-primary-400 transition-colors">
                  クライアント登録
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">
                  WORK NOWについて
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary-400 transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary-400 transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>&copy; {currentYear} WORK NOW. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
