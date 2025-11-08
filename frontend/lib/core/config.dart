class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.stripePublishableKey,
  });

  final String apiBaseUrl;
  final String stripePublishableKey;

  static const AppConfig prod = AppConfig(
    apiBaseUrl: 'https://worknow.jp',
    stripePublishableKey: 'pk_live_xxx',
  );

  static const AppConfig dev = AppConfig(
    apiBaseUrl: 'https://7524a68e-8e69-403f-ac49-a8fd6d71de3a-00-2pcpdci634d4b.pike.replit.dev',
    stripePublishableKey: 'pk_test_example',
  );
}
