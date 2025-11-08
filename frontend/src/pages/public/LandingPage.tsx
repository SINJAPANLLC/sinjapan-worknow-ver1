import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Footer } from '../../components/layout/Footer';
import { 
  Zap, 
  Shield, 
  Wallet, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { 
  staggerChildren, 
  slideUp, 
  slideUpSlow,
  scaleInSpring,
  floatAnimation,
  pulseGlow 
} from '../../utils/animations';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const features = [
    {
      icon: Zap,
      title: '即戦力マッチング',
      description: 'AIとデータ分析により、スキルと経験に基づいた精度の高いマッチングを実現',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Wallet,
      title: '安全な報酬管理',
      description: 'Stripe Connectによる国際水準のセキュリティで報酬を安全・迅速に管理',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'セキュアな環境',
      description: 'エンタープライズグレードの暗号化技術で、あなたのデータを完全保護',
      gradient: 'from-blue-400 to-cyan-500',
    },
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'アクティブユーザー' },
    { icon: TrendingUp, value: '98%', label: 'マッチング成功率' },
    { icon: CheckCircle2, value: '5,000+', label: '成約実績' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary" />
        
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-primary-light rounded-full blur-3xl opacity-30"
          variants={pulseGlow}
          animate="animate"
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-30"
          variants={pulseGlow}
          animate="animate"
          transition={{ delay: 1 }}
        />
        
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
        >
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.div
              variants={scaleInSpring}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">新しい働き方のプラットフォーム</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              style={{ 
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                lineHeight: '1.1'
              }}
              variants={slideUpSlow}
            >
              働くに、彩りを。
            </motion.h1>
            
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
              variants={slideUp}
            >
              即戦力とクライアントをつなぐ、<br className="hidden sm:inline" />
              新しいマッチングプラットフォーム
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              variants={slideUp}
            >
              <Link to="/register/worker" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="w-full sm:w-auto shadow-2xl shadow-white/20 group"
                  >
                    ワーカーとして登録
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/register/client" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-xl"
                  >
                    クライアントとして登録
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          variants={floatAnimation}
          animate="animate"
        >
          <div className="flex flex-col items-center gap-2 text-white/70">
            <span className="text-xs sm:text-sm font-medium">スクロールして詳細を見る</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)' }}>
              WORK NOWの特徴
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              最先端のテクノロジーで、理想の働き方を実現します
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15, 
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <motion.div
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                >
                  <Card className="text-center h-full p-8 group cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all duration-300">
                    <motion.div 
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1,
                        transition: { duration: 0.6 }
                      }}
                    >
                      <feature.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-neutral-800 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex p-4 rounded-full bg-gradient-primary mb-4"
                >
                  <stat.icon className="w-8 h-8 text-white" strokeWidth={2} />
                </motion.div>
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 sm:py-32 bg-gradient-to-br from-primary via-primary-dark to-secondary text-white relative overflow-hidden">
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          variants={pulseGlow}
          animate="animate"
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          variants={pulseGlow}
          animate="animate"
          transition={{ delay: 1.5 }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-8"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">今すぐ無料で始める</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)' }}>
              新しい働き方を、今すぐ体験
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed"
               style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
              登録は無料。3分で完了します。<br className="hidden sm:inline" />
              あなたの理想の働き方を見つけましょう。
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/register/worker">
                <motion.div
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="shadow-2xl shadow-black/20 text-lg px-12 py-6 group"
                  >
                    無料で登録する
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
