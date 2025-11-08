import { motion } from 'framer-motion';
import { Footer } from '../../components/layout/Footer';
import { slideUp, staggerChildren } from '../../utils/animations';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.h1
              variants={slideUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center mb-12"
            >
              プライバシーポリシー
            </motion.h1>

            <motion.div variants={slideUp} className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">個人情報の取り扱いについて</h2>
                <p className="text-neutral-600 leading-relaxed">
                  合同会社SIN JAPAN（以下「当社」といいます）は、Work Nowサービス（以下「本サービス」といいます）における個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第1条（収集する情報）</h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  当社は、本サービスの提供にあたり、以下の情報を収集します。
                </p>
                <ul className="space-y-2 text-neutral-600">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>氏名、メールアドレス、電話番号などの登録情報</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>本サービスの利用履歴</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>Cookie、IPアドレス、端末情報などの技術情報</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第2条（利用目的）</h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  当社は、収集した個人情報を以下の目的で利用します。
                </p>
                <ul className="space-y-2 text-neutral-600">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>本サービスの提供、運営、維持、保護及び改善のため</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>ユーザーからのお問い合わせに対応するため</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>本サービスに関する規約、ポリシー等の変更等を通知するため</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>本サービスに関する新機能、キャンペーン等の案内のため</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第3条（第三者提供）</h2>
                <p className="text-neutral-600 leading-relaxed">
                  当社は、法令に基づく場合を除き、ユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第4条（セキュリティ）</h2>
                <p className="text-neutral-600 leading-relaxed">
                  当社は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第5条（お問い合わせ）</h2>
                <p className="text-neutral-600 leading-relaxed">
                  個人情報の取り扱いに関するお問い合わせは、以下の連絡先までお願いいたします。
                </p>
                <p className="text-neutral-600 mt-4">
                  <strong>合同会社SIN JAPAN</strong><br />
                  メールアドレス: <a href="mailto:info@sinjapan.jp" className="text-primary hover:underline">info@sinjapan.jp</a>
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <p className="text-neutral-500 text-sm text-center">
                  最終更新日: 2025年1月1日
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
