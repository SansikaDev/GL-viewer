import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../core/auth';
import { GlButton } from '../ui/button';

@Component({
  selector: 'gl-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, GlButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  host: {
    class: 'block h-full',
  },
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
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

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected signOut(): void {
    this.closeMenu();
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
