import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { AuthService, DEMO_LOGINS } from '../../core/auth';
import { GlAlert } from '../../ui/alert';
import { GlButton } from '../../ui/button';
import { GlInput, GlLabel } from '../../ui/input';

@Component({
  selector: 'gl-login-page',
  imports: [ReactiveFormsModule, NgIcon, GlButton, GlInput, GlLabel, GlAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly demos = DEMO_LOGINS;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected fillDemo(email: string, password: string): void {
    this.form.setValue({ email, password });
    this.error.set(null);
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    const result = await this.auth.login(email, password);
    this.submitting.set(false);
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    await this.router.navigateByUrl('/dashboard');
  }
}
