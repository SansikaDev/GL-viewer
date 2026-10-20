import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('signs in a desk account and stores the session', async () => {
    const result = await service.login('Maya.Chen@folio.desk', 'settled-today');
    expect(result).toEqual({ ok: true });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe('maya.chen@folio.desk');
    expect(service.user()?.role).toBe('Controller');
    expect(sessionStorage.getItem('gl.session.v1')).toContain('maya.chen@folio.desk');
  });

  it('rejects a bad password without creating a session', async () => {
    const result = await service.login('maya.chen@folio.desk', 'wrong-password');
    expect(result).toEqual({
      ok: false,
      error: 'Email or password did not match a desk account.',
    });
    expect(service.isAuthenticated()).toBe(false);
  });

  it('locks the desk after five failed attempts', async () => {
    for (let i = 0; i < 4; i += 1) {
      const result = await service.login('maya.chen@folio.desk', 'wrong-password');
      expect(result.ok).toBe(false);
    }

    const locked = await service.login('maya.chen@folio.desk', 'wrong-password');
    expect(locked.ok).toBe(false);
    if (!locked.ok) {
      expect(locked.error).toContain('locked for 30 seconds');
    }

    const stillLocked = await service.login('maya.chen@folio.desk', 'settled-today');
    expect(stillLocked.ok).toBe(false);
    if (!stillLocked.ok) {
      expect(stillLocked.error).toMatch(/Too many attempts/);
    }
  });

  it('clears the stored session on logout', async () => {
    await service.login('ops@folio.desk', 'ledger-desk');
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('gl.session.v1')).toBeNull();
  });
});
