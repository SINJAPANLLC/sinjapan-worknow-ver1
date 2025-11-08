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
    apiBaseUrl: 'http://localhost:8000',
    stripePublishableKey: 'pk_test_example',
  );
}
