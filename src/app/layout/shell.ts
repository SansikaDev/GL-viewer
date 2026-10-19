import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth';
import { GlButton } from '../ui/button';

@Component({
  selector: 'gl-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, GlButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  protected readonly links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard', exact: true },
    { path: '/payments', label: 'Payments', icon: 'lucideReceipt', exact: false },
    { path: '/reconcile', label: 'Reconcile', icon: 'lucideScale', exact: true },
  ];

  protected signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
