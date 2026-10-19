import { Injectable, computed, signal } from '@angular/core';
import type { SessionUser } from './models';

interface DeskAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
}

const SESSION_KEY = 'gl.session.v1';
const TTL_MS = 8 * 60 * 60 * 1000;

const DESK: DeskAccount[] = [
  {
    id: 'usr_maya',
    name: 'Maya Chen',
    email: 'maya.chen@folio.desk',
    role: 'Controller',
    password: 'settled-today',
  },
  {
    id: 'usr_ops',
    name: 'Night Desk',
    email: 'ops@folio.desk',
    role: 'Operations',
    password: 'ledger-desk',
  },
];

export const DEMO_LOGINS = DESK.map(({ email, password, name, role }) => ({
  email,
  password,
  name,
  role,
}));

function readStoredSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.email || parsed.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionState = signal<SessionUser | null>(readStoredSession());
  private failedAttempts = 0;
  private lockedUntil = 0;

  readonly user = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  async login(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
    if (Date.now() < this.lockedUntil) {
      const seconds = Math.ceil((this.lockedUntil - Date.now()) / 1000);
      return { ok: false, error: `Too many attempts. Try again in ${seconds}s.` };
    }

    await wait(420);

    const account = DESK.find((row) => row.email.toLowerCase() === email.trim().toLowerCase());
    if (!account || account.password !== password) {
      this.failedAttempts += 1;
      if (this.failedAttempts >= 5) {
        this.lockedUntil = Date.now() + 30_000;
        this.failedAttempts = 0;
        return { ok: false, error: 'Too many attempts. The desk is locked for 30 seconds.' };
      }
      return { ok: false, error: 'Email or password did not match a desk account.' };
    }

    this.failedAttempts = 0;
    const session: SessionUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      expiresAt: Date.now() + TTL_MS,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionState.set(session);
    return { ok: true };
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.sessionState.set(null);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
