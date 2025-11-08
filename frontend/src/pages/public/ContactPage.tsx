import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { slideUp, staggerChildren } from '../../utils/animations';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="space-y-12"
          >
            <motion.h1
              variants={slideUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center mb-12"
            >
              お問い合わせ
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div variants={slideUp}>
                <Card padding="lg" className="h-full">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6">お問い合わせフォーム</h2>
                  
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-800 mb-2">送信完了</h3>
                      <p className="text-neutral-600">お問い合わせありがとうございます。<br />担当者より折り返しご連絡いたします。</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          お名前 *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                          placeholder="山田 太郎"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          メールアドレス *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                          placeholder="email@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          件名 *
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                          placeholder="お問い合わせ内容"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          お問い合わせ内容 *
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
                          placeholder="お問い合わせ内容をご記入ください"
                          rows={6}
                          required
                        />
                      </div>

                      <Button type="submit" variant="primary" size="lg" fullWidth>
                        送信する
                      </Button>
                    </form>
                  )}
                </Card>
              </motion.div>

              <motion.div variants={slideUp} className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6">会社情報</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">所在地</h3>
                        <p className="text-neutral-600 text-sm">
                          〒243-0303<br />
                          神奈川県愛甲郡愛川町中津7287
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">電話番号</h3>
                        <p className="text-neutral-600 text-sm">
                          050-5526-9906
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">メールアドレス</h3>
                        <p className="text-neutral-600 text-sm">
                          <a href="mailto:info@sinjapan.jp" className="text-primary hover:underline">
                            info@sinjapan.jp
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card padding="lg" className="bg-gradient-primary text-white">
                  <h3 className="text-xl font-bold mb-3">営業時間</h3>
                  <p className="text-white/90">
                    平日 9:00 - 18:00<br />
                    土日祝日は休業
                  </p>
                  <p className="text-sm text-white/70 mt-4">
                    ※お問い合わせへの返信は、営業時間内に順次対応させていただきます。
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
