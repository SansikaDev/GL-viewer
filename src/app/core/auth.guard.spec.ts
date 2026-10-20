import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth';

describe('route guards', () => {
  const createUrlTree = vi.fn((commands: unknown[]) => ({ commands }) as unknown as UrlTree);

  function setup(authenticated: boolean): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => authenticated } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
    createUrlTree.mockClear();
  }

  it('authGuard sends anonymous users to login', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ commands: ['/login'] });
  });

  it('authGuard allows a signed-in desk user through', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('guestGuard sends a signed-in user to the dashboard', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('guestGuard allows the login page for anonymous users', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(result).toBe(true);
  });
});
