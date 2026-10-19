import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { Shell } from './layout/shell';
import { DashboardPage } from './pages/dashboard/dashboard';
import { LoginPage } from './pages/login/login';
import { PaymentDetailPage } from './pages/payment-detail/payment-detail';
import { PaymentsPage } from './pages/payments/payments';
import { ReconcilePage } from './pages/reconcile/reconcile';

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPage },
      { path: 'payments', component: PaymentsPage },
      { path: 'payments/:id', component: PaymentDetailPage },
      { path: 'reconcile', component: ReconcilePage },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
