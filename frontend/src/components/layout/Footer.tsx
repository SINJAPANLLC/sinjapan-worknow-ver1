import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-neutral-400 text-sm space-y-1">
              <p className="font-semibold text-neutral-300">運営会社</p>
              <p>合同会社SIN JAPAN</p>
              <p>〒243-0303</p>
              <p>神奈川県愛甲郡愛川町中津7287</p>
              <p>TEL. 050-5526-9906</p>
              <p>
                <a href="mailto:info@sinjapan.jp" className="hover:text-primary-400 transition-colors">
                  MAIL. info@sinjapan.jp
                </a>
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">
                  Work Nowについて
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
          <p>&copy; {currentYear} Work Now by 合同会社SIN JAPAN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
