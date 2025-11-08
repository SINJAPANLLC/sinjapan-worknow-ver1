import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Footer } from '../../components/layout/Footer';
import { 
  Compass,
  Wallet,
  ShieldCheck,
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

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const duration = 2000;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(value);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const features = [
    {
      icon: Compass,
      title: '自由な働き方',
      description: 'いつでも、どこでも、好きな仕事を選べる',
      gradient: 'from-primary via-primary-dark to-secondary',
    },
    {
      icon: Wallet,
      title: '即日報酬',
      description: '働いた分だけ、すぐに受け取れる',
      gradient: 'from-primary via-primary-dark to-secondary',
    },
    {
      icon: ShieldCheck,
      title: '信頼できるマッチング',
      description: '企業との安心・安全なつながり',
      gradient: 'from-primary via-primary-dark to-secondary',
    },
  ];

  const stats = [
    { icon: Users, value: 10000, suffix: '+', label: 'アクティブユーザー' },
    { icon: TrendingUp, value: 98, suffix: '%', label: 'マッチング成功率' },
    { icon: CheckCircle2, value: 5000, suffix: '+', label: '成約実績' },
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
              <span className="text-sm font-medium">自由に稼ぐプラットフォーム</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              style={{ 
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                lineHeight: '1.2'
              }}
              variants={slideUpSlow}
            >
              働き方に彩りを。
              <br />
              採用には自由を。
            </motion.h1>
            
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
                    Workerとして登録
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
                    Clientとして登録
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-700 to-primary" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)' }}>
              Work Nowの特徴
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.12, 
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <Card className="text-center h-full p-10 group cursor-pointer bg-gradient-to-b from-white to-neutral-50/50 border border-white/40 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                  <motion.div 
                    className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                    whileHover={{ 
                      y: -6,
                      scale: 1.04,
                      transition: { type: "spring", stiffness: 180, damping: 24 }
                    }}
                  >
                    <feature.icon className="w-10 h-10 text-white" strokeWidth={2.25} />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm sm:text-base font-medium">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ 
                    y: -4,
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 200, damping: 20 }
                  }}
                  className="inline-flex p-6 rounded-2xl bg-white shadow-lg border border-neutral-200/50 mb-6"
                >
                  <stat.icon className="w-10 h-10 text-primary" strokeWidth={2.25} />
                </motion.div>
                <div className="text-5xl sm:text-6xl font-bold text-primary mb-3">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-neutral-600 font-medium text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
