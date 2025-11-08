import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/auth_service.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/applications/applications_screen.dart';
import '../screens/assignments/assignments_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/jobs/job_detail_screen.dart';
import '../screens/jobs/job_list_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/reviews/reviews_screen.dart';
import '../screens/wallet/wallet_screen.dart';

final appShellRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(currentUserProvider);

  return GoRouter(
    initialLocation: '/home',
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => AppNavigationShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: 'home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: 'jobs',
                builder: (context, state) => const JobListScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: 'applications',
                builder: (context, state) => const ApplicationsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: 'notifications',
                builder: (context, state) => const NotificationsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: 'profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/jobs/detail/:id',
        builder: (context, state) => JobDetailScreen(jobId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/assignments',
        builder: (context, state) => const AssignmentsScreen(),
      ),
      GoRoute(
        path: '/reviews',
        builder: (context, state) => const ReviewsScreen(),
      ),
      GoRoute(
        path: '/wallet',
        builder: (context, state) => const WalletScreen(),
      ),
      GoRoute(
        path: '/admin/dashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
    ],
    redirect: (context, state) {
      final isAuthenticated = authState.valueOrNull != null;
      final isLoggingIn = state.matchedLocation == '/login';

      if (!isAuthenticated && !isLoggingIn) {
        return '/login';
      }
      if (isAuthenticated && isLoggingIn) {
        return '/home';
      }
      return null;
    },
  );
});

class AppNavigationShell extends StatelessWidget {
  const AppNavigationShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _onDestinationSelected(int index) {
    navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: _onDestinationSelected,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'ホーム'),
          NavigationDestination(icon: Icon(Icons.work_outline), label: '求人'),
          NavigationDestination(icon: Icon(Icons.assignment_outlined), label: '応募'),
          NavigationDestination(icon: Icon(Icons.notifications_outlined), label: '通知'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'プロフィール'),
        ],
      ),
    );
  }
}
