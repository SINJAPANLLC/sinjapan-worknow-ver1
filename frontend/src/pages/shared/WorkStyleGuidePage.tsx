import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  QrCode, 
  FileText, 
  Users, 
  CreditCard, 
  Clock,
  Heart,
  Shield,
  TrendingUp,
  Home,
  Search,
  User
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/layout/BottomNav';

const steps = [
  {
    number: 1,
    title: '求人を探す',
    description: '気になる仕事を見つけたら、応募ボタンをタップ',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: 2,
    title: 'クライアントが選択',
    description: 'クライアントがあなたを選んだら通知が届きます',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: 3,
    title: 'QRコードでチェックイン',
    description: '職場のQRコードをスキャンして勤務開始',
    icon: QrCode,
    color: 'from-[#00CED1] to-[#009999]',
  },
  {
    number: 4,
    title: '即時報酬',
    description: 'チェックアウト後、すぐに報酬を受け取れます',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-500',
  },
];

const benefits = [
  { icon: Clock, title: '好きな時間に働ける', description: '自分のスケジュールに合わせて自由に選べます' },
  { icon: CreditCard, title: '即時報酬システム', description: '働いたその日に報酬が手に入ります' },
  { icon: Shield, title: '安心・安全', description: '審査済みの企業のみ掲載しています' },
  { icon: TrendingUp, title: 'スキルアップ', description: '様々な職場で経験を積めます' },
];

export default function WorkStyleGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 pt-24 md:pt-28 pb-24">
      <div className="bg-gradient-to-r from-[#00CED1] to-[#009999] px-6 py-8 shadow-lg">
        <Link to="/applications" className="inline-flex items-center gap-2 text-white hover:text-white/80 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white font-medium">戻る</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-white">働き方ガイド</h1>
        <p className="text-white/95">Work Nowで働くための完全ガイド</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl mb-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent mb-3 px-4">
              働き方に彩りを。<br className="sm:hidden"/>採用には自由を。
            </h2>
            <p className="text-sm sm:text-base text-gray-700 px-4">
              Work Nowは、あなたの働き方を自由にデザインできる新しいプラットフォームです。
            </p>
          </div>
        </motion.div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">はじめ方 - 4つのステップ</h3>
          <div className="grid gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="info" size="sm" className="whitespace-nowrap flex-shrink-0">STEP {step.number}</Badge>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900">{step.title}</h4>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Work Nowの特徴</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                      <p className="text-sm text-gray-700">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">よくある質問</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <Check className="w-5 h-5 text-[#00CED1] flex-shrink-0 mt-0.5" />
                未経験でも大丈夫ですか？
              </h4>
              <p className="text-gray-700 ml-7">
                はい、大丈夫です！多くの求人が未経験者を歓迎しています。丁寧な研修やサポートがあるので安心してください。
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <Check className="w-5 h-5 text-[#00CED1] flex-shrink-0 mt-0.5" />
                報酬はいつ受け取れますか？
              </h4>
              <p className="text-gray-700 ml-7">
                Work Nowの即時報酬システムにより、働いたその日に報酬を受け取ることができます。
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <Check className="w-5 h-5 text-[#00CED1] flex-shrink-0 mt-0.5" />
                どのような仕事がありますか？
              </h4>
              <p className="text-gray-700 ml-7">
                軽作業、接客、事務、ITなど幅広い職種があります。あなたのスキルや希望に合った仕事を見つけられます。
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <Check className="w-5 h-5 text-[#00CED1] flex-shrink-0 mt-0.5" />
                キャンセルはできますか？
              </h4>
              <p className="text-gray-700 ml-7">
                応募後のキャンセルは可能ですが、採用後は企業との契約になりますので、責任を持って働きましょう。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#00CED1] to-[#009999] rounded-3xl p-8 text-center text-white shadow-2xl">
          <h3 className="text-2xl font-bold mb-4">さあ、始めましょう！</h3>
          <p className="mb-6 text-white/90">
            今すぐ理想の仕事を見つけて、新しい働き方を始めましょう
          </p>
          <Link to="/jobs">
            <Button 
              variant="primary" 
              className="bg-white text-[#00CED1] hover:bg-gray-100 px-8 py-4 rounded-xl shadow-lg font-bold"
            >
              求人を探す
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav
        items={[
          { label: 'ホーム', path: '/dashboard', icon: Home },
          { label: '求人検索', path: '/jobs', icon: Search },
          { label: '応募履歴', path: '/applications', icon: FileText },
          { label: 'プロフィール', path: '/profile', icon: User },
        ]}
      />
    </div>
  );
}
