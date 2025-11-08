import { motion } from 'framer-motion';
import { Footer } from '../../components/layout/Footer';
import { slideUp, staggerChildren } from '../../utils/animations';

export default function TermsPage() {
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
              利用規約
            </motion.h1>

            <motion.div variants={slideUp} className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第1条（適用）</h2>
                <p className="text-neutral-600 leading-relaxed">
                  本規約は、合同会社SIN JAPAN（以下「当社」といいます）が提供するWork Nowサービス（以下「本サービス」といいます）の利用条件を定めるものです。
                  ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第2条（利用登録）</h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第3条（禁止事項）</h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                </p>
                <ul className="space-y-2 text-neutral-600">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>法令または公序良俗に違反する行為</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>犯罪行為に関連する行為</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>当社、本サービスの他のユーザー、または第三者の知的財産権を侵害する行為</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>本サービスの運営を妨害するおそれのある行為</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span>不正アクセスをし、またはこれを試みる行為</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">第4条（免責事項）</h2>
                <p className="text-neutral-600 leading-relaxed">
                  当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
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
