import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Footer } from '../../components/layout/Footer';
import { staggerChildren, slideUp } from '../../utils/animations';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <motion.div
          className="relative z-10 container mx-auto px-4 text-center text-white"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            variants={slideUp}
          >
            働くに、彩りを。
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto"
            variants={slideUp}
          >
            即戦力とクライアントをつなぐ、新しいマッチングプラットフォーム
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={slideUp}
          >
            <Link to="/register/worker">
              <Button size="lg" variant="secondary">
                ワーカーとして登録
              </Button>
            </Link>
            <Link to="/register/client">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
                クライアントとして登録
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="text-white/50 text-sm">
            スクロールして詳細を見る
          </div>
          <div className="mt-2 w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-3 bg-white/50 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </section>
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            WORK NOWの特徴
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: '即戦力マッチング',
                description: 'スキルと経験に基づいた精度の高いマッチングで、最適な案件を見つけます。'
              },
              {
                icon: '💰',
                title: '安全な報酬管理',
                description: 'Stripe Connectによる安全かつ迅速な報酬の受け取りが可能です。'
              },
              {
                icon: '🔒',
                title: 'セキュアな環境',
                description: '最新のセキュリティ技術で、あなたの情報を守ります。'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-800">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            今すぐ始めましょう
          </motion.h2>
          
          <motion.p
            className="text-xl mb-12 text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            無料で登録して、新しい働き方を体験してください
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/register/worker">
              <Button size="lg" variant="secondary">
                無料で登録する
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
