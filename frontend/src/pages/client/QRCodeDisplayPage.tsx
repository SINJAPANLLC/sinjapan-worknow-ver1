import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { qrAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, QrCode, RefreshCw, Clock, CheckCircle } from 'lucide-react';

export default function QRCodeDisplayPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [qrType, setQrType] = useState<'check_in' | 'check_out'>('check_in');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const { data: qrData, isLoading, refetch } = useQuery({
    queryKey: ['qr-code', assignmentId, qrType],
    queryFn: () => {
      if (!assignmentId) throw new Error('Assignment ID required');
      return qrType === 'check_in' 
        ? qrAPI.getCheckInQR(assignmentId)
        : qrAPI.getCheckOutQR(assignmentId);
    },
    enabled: !!assignmentId,
    refetchInterval: false, // Don't auto-refetch to prevent unnecessary token generation
  });

  useEffect(() => {
    if (!qrData?.expires_at) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(qrData.expires_at).getTime();
      const remaining = expires - now;

      if (remaining <= 0) {
        setTimeRemaining('有効期限切れ');
        return;
      }

      const minutes = Math.floor(remaining / 1000 / 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  if (!assignmentId) {
    navigate('/jobs/manage');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 pt-16 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={() => navigate('/jobs/manage')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </Button>

        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              勤怠QRコード
            </h1>
            {qrData && (
              <p className="text-gray-700">
                {qrData.company_name}
              </p>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setQrType('check_in')}
              variant={qrType === 'check_in' ? 'primary' : 'outline'}
              className={qrType === 'check_in' ? 'flex-1 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white' : 'flex-1'}
            >
              チェックイン
            </Button>
            <Button
              onClick={() => setQrType('check_out')}
              variant={qrType === 'check_out' ? 'primary' : 'outline'}
              className={qrType === 'check_out' ? 'flex-1 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white' : 'flex-1'}
            >
              チェックアウト
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00CED1] mx-auto"></div>
              <p className="text-gray-700 mt-4">QRコードを生成中...</p>
            </div>
          ) : qrData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-2xl shadow-inner border-4 border-[#00CED1]">
                <img 
                  src={qrData.qr_code_image} 
                  alt="QR Code" 
                  className="w-full h-auto"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#00CED1]" />
                  <span className="font-bold text-gray-900">有効期限</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent">
                  {timeRemaining}
                </span>
              </div>

              <Button
                onClick={() => refetch()}
                variant="outline"
                className="w-full border-[#00CED1] text-[#00CED1] hover:bg-[#00CED1]/10"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                新しいQRコードを生成
              </Button>

              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  使い方
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-7">
                  <li>• ワーカーにこのQRコードをスキャンしてもらいます</li>
                  <li>• QRコードは30分間有効です</li>
                  <li>• 一度使用されたQRコードは無効になります</li>
                  <li>• 新しいワーカーには新しいQRコードを生成してください</li>
                </ul>
              </div>
            </motion.div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
