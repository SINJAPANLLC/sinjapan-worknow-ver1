import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/controllers/payments_controller.dart';
import '../../core/models/payment.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  @override
  void initState() {
    super.initState();
    ref.read(paymentHistoryProvider.notifier).load();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(paymentHistoryProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('ウォレット')),
      body: state.when(
        data: (payments) => ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: payments.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final payment = payments[index];
            return _PaymentTile(payment: payment);
          },
        ),
        error: (error, _) => Center(child: Text('決済履歴取得に失敗しました: $error')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: const Text('Stripe 口座管理'),
        icon: const Icon(Icons.account_balance_outlined),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  const _PaymentTile({required this.payment});

  final Payment payment;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text('${payment.amount} ${payment.currency.toUpperCase()}'),
        subtitle: Text('ステータス: ${payment.status}'),
        trailing: payment.status == 'succeeded'
            ? const Icon(Icons.check_circle, color: Colors.teal)
            : const Icon(Icons.timelapse),
      ),
    );
  }
}
