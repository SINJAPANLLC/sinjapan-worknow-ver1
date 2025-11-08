import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BottomNav } from '../components/layout/BottomNav';
import { MessageCircle, Mail, Phone, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'アカウントの登録方法を教えてください',
    answer: 'トップページの「Worker登録」または「Client登録」ボタンをクリックし、必要な情報を入力してください。メールアドレスとパスワードは必須です。',
  },
  {
    question: '仕事の応募方法は？',
    answer: '仕事一覧から希望の仕事をタップし、詳細ページの「応募する」ボタンをクリックしてください。企業からの承認をお待ちください。',
  },
  {
    question: '報酬の受け取り方法は？',
    answer: 'プロフィールページから銀行口座を登録し、出金可能残高から出金申請を行ってください。申請後、通常3-5営業日で振り込まれます。',
  },
  {
    question: 'パスワードを忘れた場合は？',
    answer: 'ログイン画面の「パスワードを忘れた」リンクをクリックし、登録したメールアドレスを入力してください。リセットリンクが送信されます。',
  },
  {
    question: '本人確認書類は何が必要ですか？',
    answer: '運転免許証、マイナンバーカード、パスポートなどの公的身分証明書をプロフィールページからアップロードしてください。',
  },
];

export function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00CED1]/80 to-[#009999] pb-28">
      <div className="container mx-auto px-4 pt-24 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-6 break-keep">サポート</h1>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 break-keep">お問い合わせ</h2>
              <div className="space-y-4">
                <a href="mailto:support@worknow-japan.com" className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="font-semibold break-keep">メールサポート</p>
                    <p className="text-sm opacity-90">support@worknow-japan.com</p>
                  </div>
                </a>
                <a href="tel:0120-xxx-xxxx" className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="font-semibold break-keep">電話サポート</p>
                    <p className="text-sm opacity-90">0120-XXX-XXXX (平日10:00-18:00)</p>
                  </div>
                </a>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 break-keep flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                よくある質問
              </h2>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold break-keep">{faq.question}</span>
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 flex-shrink-0 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-500" />
                      )}
                    </button>
                    {openIndex === index && (
                      <div className="px-4 pb-4 text-gray-700 break-keep">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 border-2 border-[#00CED1]/20">
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[#00CED1]" />
              <h3 className="text-lg font-bold mb-2 break-keep">チャットサポート</h3>
              <p className="text-gray-700 mb-4 break-keep">
                お急ぎの方は、チャットでお問い合わせいただけます
              </p>
              <Button variant="primary" className="w-full">
                チャットを開始
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
