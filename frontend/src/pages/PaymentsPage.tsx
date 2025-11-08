import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { 
  bankAccountsAPI, 
  withdrawalsAPI,
  paymentsAPI
} from '../lib/api';
import { Sparkles, Zap, Flame, Bell, UserCircle } from 'lucide-react';
import { BottomNav } from '../components/layout/BottomNav';
import type { 
  BankAccount, 
  BankAccountCreate, 
  WithdrawalRequestCreate,
  WithdrawalRequest
} from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/format';

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const isWorker = user?.role === 'worker';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 p-4 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            決済情報
          </h1>
        </motion.div>

        {isWorker ? <WorkerPaymentsView /> : <CompanyPaymentsView />}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: user.role === 'worker' ? '/jobs' : user.role === 'company' ? '/jobs/manage' : '/admin/users', icon: Sparkles },
          { label: 'はたらく', path: user.role === 'worker' ? '/applications' : user.role === 'company' ? '/jobs/new' : '/admin/jobs', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/notifications', icon: Bell },
          { label: 'マイページ', path: user.role === 'admin' ? '/admin/stats' : '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}

function WorkerPaymentsView() {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['withdrawal-balance'],
    queryFn: () => withdrawalsAPI.getBalance(),
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => bankAccountsAPI.list(),
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => withdrawalsAPI.list({ limit: 20 }),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <BalanceCard balance={balance} isLoading={balanceLoading} />
        <QuickActionsCard 
          onAddAccount={() => setShowAddAccount(true)}
          onRequestWithdrawal={() => setShowWithdrawal(true)}
        />
      </div>

      <BankAccountsSection
        accounts={accounts}
        isLoading={accountsLoading}
        showAddForm={showAddAccount}
        onCloseAddForm={() => setShowAddAccount(false)}
      />

      <WithdrawalRequestSection
        accounts={accounts}
        showForm={showWithdrawal}
        onCloseForm={() => setShowWithdrawal(false)}
      />

      <WithdrawalHistorySection
        withdrawals={withdrawals}
        isLoading={withdrawalsLoading}
      />
    </div>
  );
}

function CompanyPaymentsView() {
  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsAPI.list({ assignment_id: undefined, status: undefined }),
  });

  const payments = paymentData?.items || [];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">支払履歴</h2>
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">支払履歴がありません</div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(payment.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <Badge variant={payment.status === 'completed' ? 'success' : 'neutral'}>
                {payment.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function BalanceCard({ balance, isLoading }: { balance?: { available: number; pending: number }; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="w-5 h-5" />
        <span className="text-sm opacity-90">利用可能残高</span>
      </div>
      <div className="text-3xl font-bold mb-4">
        {formatCurrency(balance?.available || 0)}
      </div>
      <div className="text-sm opacity-75">
        保留中: {formatCurrency(balance?.pending || 0)}
      </div>
    </Card>
  );
}

function QuickActionsCard({ 
  onAddAccount, 
  onRequestWithdrawal 
}: { 
  onAddAccount: () => void; 
  onRequestWithdrawal: () => void; 
}) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">クイックアクション</h3>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={onAddAccount}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          振込先口座を追加
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={onRequestWithdrawal}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          振込申請
        </Button>
      </div>
    </Card>
  );
}

function BankAccountsSection({ 
  accounts, 
  isLoading, 
  showAddForm, 
  onCloseAddForm 
}: { 
  accounts: BankAccount[]; 
  isLoading: boolean; 
  showAddForm: boolean; 
  onCloseAddForm: () => void; 
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">振込先口座</h2>
        {!showAddForm && (
          <Button size="sm" onClick={() => onCloseAddForm()}>
            <Plus className="w-4 h-4 mr-1" />
            追加
          </Button>
        )}
      </div>

      {showAddForm && <AddBankAccountForm onSuccess={onCloseAddForm} />}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          登録済みの振込先口座がありません
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {accounts.map((account) => (
            <BankAccountItem key={account.id} account={account} />
          ))}
        </div>
      )}
    </Card>
  );
}

function BankAccountItem({ account }: { account: BankAccount }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bankAccountsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });

  return (
    <motion.div
      layout
      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{account.bank_name}</span>
          {account.is_default && (
            <Badge variant="success" size="sm">デフォルト</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {account.branch_name} {account.account_type === 'ordinary' ? '普通' : '当座'} {account.account_number}
        </p>
        <p className="text-xs text-gray-500">{account.account_holder_name}</p>
      </div>
      <button
        onClick={() => {
          if (confirm('この口座を削除しますか？')) {
            deleteMutation.mutate(account.id);
          }
        }}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function AddBankAccountForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<BankAccountCreate>({
    bank_name: '',
    branch_name: '',
    account_type: 'ordinary',
    account_number: '',
    account_holder_name: '',
    is_default: false,
  });

  const mutation = useMutation({
    mutationFn: (data: BankAccountCreate) => bankAccountsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">銀行名</label>
          <input
            type="text"
            required
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="例: みずほ銀行"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">支店名</label>
          <input
            type="text"
            required
            value={formData.branch_name}
            onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="例: 渋谷支店"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">口座種別</label>
          <select
            value={formData.account_type}
            onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'ordinary' | 'current' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ordinary">普通</option>
            <option value="current">当座</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">口座番号</label>
          <input
            type="text"
            required
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="7桁の番号"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">口座名義（カタカナ）</label>
          <input
            type="text"
            required
            value={formData.account_holder_name}
            onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="例: ヤマダタロウ"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm">この口座をデフォルトに設定</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? '追加中...' : '口座を追加'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          キャンセル
        </Button>
      </div>
      {mutation.error && (
        <div className="text-sm text-red-600">
          エラー: {mutation.error.message}
        </div>
      )}
    </motion.form>
  );
}

function WithdrawalRequestSection({ 
  accounts, 
  showForm, 
  onCloseForm 
}: { 
  accounts: BankAccount[]; 
  showForm: boolean; 
  onCloseForm: () => void; 
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<WithdrawalRequestCreate>({
    bank_account_id: '',
    amount: 0,
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: (data: WithdrawalRequestCreate) => withdrawalsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-balance'] });
      setFormData({ bank_account_id: '', amount: 0, notes: '' });
      onCloseForm();
    },
  });

  if (!showForm) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bank_account_id) {
      alert('振込先口座を選択してください');
      return;
    }
    if (formData.amount <= 0) {
      alert('金額を入力してください');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">振込申請</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">振込先口座</label>
          <select
            required
            value={formData.bank_account_id}
            onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">選択してください</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bank_name} {account.branch_name} {account.account_number}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">金額（円）</label>
          <input
            type="number"
            required
            min="1"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="例: 10000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">備考（任意）</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            placeholder="特記事項があれば入力してください"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '申請中...' : '振込申請を送信'}
          </Button>
          <Button type="button" variant="outline" onClick={onCloseForm}>
            キャンセル
          </Button>
        </div>
        {mutation.error && (
          <div className="text-sm text-red-600">
            エラー: {mutation.error.message}
          </div>
        )}
      </form>
    </Card>
  );
}

function WithdrawalHistorySection({ 
  withdrawals, 
  isLoading 
}: { 
  withdrawals: WithdrawalRequest[]; 
  isLoading: boolean; 
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '申請中';
      case 'processing':
        return '処理中';
      case 'completed':
        return '完了';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">振込履歴</h2>
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">振込履歴がありません</div>
      ) : (
        <div className="space-y-2">
          {withdrawals.map((withdrawal) => (
            <motion.div
              key={withdrawal.id}
              layout
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(withdrawal.status)}
                  <span className="font-medium">{formatCurrency(withdrawal.amount)}</span>
                  <Badge 
                    variant={
                      withdrawal.status === 'completed' ? 'success' :
                      withdrawal.status === 'rejected' ? 'danger' :
                      'neutral'
                    }
                    size="sm"
                  >
                    {getStatusText(withdrawal.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {withdrawal.bank_name} {withdrawal.account_number}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(withdrawal.created_at).toLocaleString('ja-JP')}
                </p>
                {withdrawal.admin_notes && (
                  <p className="text-xs text-gray-600 mt-1">
                    管理者備考: {withdrawal.admin_notes}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
