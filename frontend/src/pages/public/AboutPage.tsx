import { motion } from 'framer-motion';
import { Footer } from '../../components/layout/Footer';
import { slideUp, staggerChildren } from '../../utils/animations';

export default function AboutPage() {
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
              Work Nowについて
            </motion.h1>

            <motion.div variants={slideUp} className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">私たちのミッション</h2>
                <p className="text-neutral-600 leading-relaxed">
                  Work Nowは、働き方に彩りを、採用には自由をもたらす即戦力マッチング&報酬プラットフォームです。
                  私たちは、働く人々が自由に仕事を選び、企業が必要な時に必要な人材を見つけられる世界を目指しています。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">サービスの特徴</h2>
                <ul className="space-y-4 text-neutral-600">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span><strong>自由な働き方：</strong>いつでも、どこでも、好きな仕事を選べます</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span><strong>即日報酬：</strong>働いた分だけ、すぐに受け取れます</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                    <span><strong>信頼できるマッチング：</strong>企業との安心・安全なつながりを提供します</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">運営会社</h2>
                <div className="text-neutral-600 space-y-2">
                  <p><strong>会社名：</strong>合同会社SIN JAPAN（SIN JAPAN LLC）</p>
                  <p><strong>所在地：</strong>〒243-0303 神奈川県愛甲郡愛川町中津7287</p>
                  <p><strong>電話：</strong>050-5526-9906</p>
                  <p><strong>メール：</strong><a href="mailto:info@sinjapan.jp" className="text-primary hover:underline">info@sinjapan.jp</a></p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
