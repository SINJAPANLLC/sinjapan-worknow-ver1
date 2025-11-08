import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { qrAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function QRScanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assignmentId = searchParams.get('assignment_id');
  const scanType = searchParams.get('type') as 'check_in' | 'check_out';
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkInMutation = useMutation({
    mutationFn: (data: { token: string; assignment_id: string }) => qrAPI.checkIn(data),
    onSuccess: (data) => {
      setScanning(false);
      setResult(data);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'チェックインに失敗しました');
      setScanning(false);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: { token: string; assignment_id: string }) => qrAPI.checkOut(data),
    onSuccess: (data) => {
      setScanning(false);
      setResult(data);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'チェックアウトに失敗しました');
      setScanning(false);
    },
  });

  useEffect(() => {
    if (!assignmentId || !scanType) {
      navigate('/applications');
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        qrbox: 250,
        fps: 10,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Parse QR code data safely
        try {
          const data = JSON.parse(decodedText);
          
          // Validate data structure
          if (!data.token || !data.assignment_id || !data.type) {
            throw new Error('Invalid QR code format');
          }
          
          // Verify this QR is for the current assignment and scan type
          if (data.assignment_id !== assignmentId) {
            setError('このQRコードは別のお仕事のものです');
            setScanning(false);
            return;
          }
          
          if (data.type !== scanType) {
            setError(`このQRコードは${data.type === 'check_in' ? 'チェックイン' : 'チェックアウト'}用です`);
            setScanning(false);
            return;
          }
          
          if (scanType === 'check_in') {
            checkInMutation.mutate({
              token: data.token,
              assignment_id: assignmentId,
            });
          } else {
            checkOutMutation.mutate({
              token: data.token,
              assignment_id: assignmentId,
            });
          }
        } catch (err) {
          setError('無効なQRコードです');
          setScanning(false);
        }
      },
      (errorMessage) => {
        // Ignore scan errors (these are thrown frequently)
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [assignmentId, scanType]);

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {scanType === 'check_in' ? 'チェックイン完了！' : 'チェックアウト完了！'}
            </h2>
            
            <p className="text-gray-700 mb-6">
              {result.company_name} での勤務を{scanType === 'check_in' ? '開始' : '終了'}しました
            </p>

            {scanType === 'check_out' && result.hours_worked && (
              <div className="bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-[#00CED1]" />
                  <span className="font-bold text-gray-900">勤務時間</span>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent">
                  {result.hours_worked} 時間
                </p>
              </div>
            )}

            <Button
              onClick={() => navigate('/applications')}
              className="w-full bg-gradient-to-r from-[#00CED1] to-[#009999] text-white"
            >
              はたらくページへ戻る
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">エラー</h2>
            <p className="text-gray-700 mb-6">{error}</p>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setError(null);
                  setScanning(true);
                  window.location.reload();
                }}
                variant="outline"
                className="flex-1"
              >
                再試行
              </Button>
              <Button
                onClick={() => navigate('/applications')}
                className="flex-1 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white"
              >
                戻る
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 pt-16 pb-24 px-4">
      <div className="max-w-md mx-auto">
        <Button
          onClick={() => navigate('/applications')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </Button>

        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {scanType === 'check_in' ? 'チェックイン' : 'チェックアウト'}
            </h1>
            <p className="text-gray-700">
              職場のQRコードをスキャンしてください
            </p>
          </div>

          <div id="qr-reader" className="rounded-xl overflow-hidden"></div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              💡 QRコードは職場に掲示されています。<br/>
              カメラをQRコードに向けてスキャンしてください。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
