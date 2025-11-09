import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  ArrowLeft,
  Receipt
} from 'lucide-react';
import { paymentsAPI, type Payment } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { slideUp, fadeIn } from '../../utils/animations';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sparkles, Zap, Flame, MessageCircle, UserCircle } from 'lucide-react';

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export default function ClientPaymentsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsAPI.list({}),
  });

  const payments = paymentsData?.items || [];

  const filteredPayments = statusFilter === 'all'
    ? payments
    : payments.filter((p: Payment) => p.status === statusFilter);

  const stats = {
    total: payments.reduce((sum: number, p: Payment) => sum + p.amount, 0),
    completed: payments.filter((p: Payment) => p.status === 'completed').length,
    pending: payments.filter((p: Payment) => p.status === 'pending').length,
    processing: payments.filter((p: Payment) => p.status === 'processing').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { variant: 'success' as const, text: '完了', icon: CheckCircle };
      case 'processing':
        return { variant: 'warning' as const, text: '処理中', icon: Clock };
      case 'pending':
        return { variant: 'neutral' as const, text: '保留中', icon: Clock };
      case 'failed':
        return { variant: 'danger' as const, text: '失敗', icon: XCircle };
      default:
        return { variant: 'neutral' as const, text: status, icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24 pt-28">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          {...fadeIn}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => navigate('/client/dashboard')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-4xl font-bold text-white">支払い管理</h1>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div {...slideUp}>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  ¥{stats.total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">総支払額</div>
              </div>
            </Card>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.1 }}>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-600 mt-1">完了</div>
              </div>
            </Card>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.2 }}>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.processing}
                </div>
                <div className="text-sm text-gray-600 mt-1">処理中</div>
              </div>
            </Card>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.3 }}>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600 mt-1">保留中</div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filter */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">すべて ({payments.length})</option>
              <option value="completed">完了 ({payments.filter((p: Payment) => p.status === 'completed').length})</option>
              <option value="processing">処理中 ({payments.filter((p: Payment) => p.status === 'processing').length})</option>
              <option value="pending">保留中 ({payments.filter((p: Payment) => p.status === 'pending').length})</option>
              <option value="failed">失敗 ({payments.filter((p: Payment) => p.status === 'failed').length})</option>
            </select>
          </div>
        </motion.div>

        {/* Payments List */}
        <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
          {paymentsLoading ? (
            <Card className="bg-white/95 backdrop-blur-sm p-12">
              <div className="text-center text-gray-500">読み込み中...</div>
            </Card>
          ) : filteredPayments.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm p-12">
              <div className="text-center text-gray-500">
                <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>支払い履歴がありません</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment: Payment) => {
                const statusBadge = getStatusBadge(payment.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <motion.div
                    key={payment.id}
                    layout
                    {...slideUp}
                  >
                    <Card className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <DollarSign className="w-5 h-5 text-primary" />
                              <h3 className="text-2xl font-bold text-gray-900">
                                ¥{payment.amount.toLocaleString()}
                              </h3>
                              <Badge variant={statusBadge.variant}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusBadge.text}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(payment.created_at).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedPayment(payment)}
                            variant="outline"
                            size="sm"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            詳細
                          </Button>
                        </div>

                        {payment.assignment_id && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                            <Briefcase className="w-4 h-4" />
                            <span>案件ID: {payment.assignment_id}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">支払い詳細</h2>
                  <Button
                    onClick={() => setSelectedPayment(null)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    支払い情報
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">金額:</span>
                      <span className="font-bold text-2xl text-primary">
                        ¥{selectedPayment.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ステータス:</span>
                      <Badge variant={getStatusBadge(selectedPayment.status).variant}>
                        {getStatusBadge(selectedPayment.status).text}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">支払いID:</span>
                      <span className="font-mono text-xs text-gray-900">{selectedPayment.id}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                {selectedPayment.assignment_id && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      案件情報
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">案件ID:</span>
                        <span className="font-medium text-gray-900">{selectedPayment.assignment_id}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    日時情報
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">作成日時:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedPayment.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">更新日時:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedPayment.updated_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav
        items={[
          { label: 'ダッシュボード', path: '/client/dashboard', icon: Sparkles },
          { label: '求人作成', path: '/client/jobs/new', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}

function Briefcase({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
