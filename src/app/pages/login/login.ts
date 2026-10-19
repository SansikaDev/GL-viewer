import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { AuthService, DEMO_LOGINS } from '../../core/auth';
import { GlAlert } from '../../ui/alert';

@Component({
  selector: 'gl-login-page',
  imports: [ReactiveFormsModule, NgIcon, GlAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: {
    '(document:mousemove)': 'onMouseMove($event)',
  },
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly blobEls = viewChildren<ElementRef<HTMLDivElement>>('blobEl');
  private readonly reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly demos = DEMO_LOGINS;
  protected readonly blobs = [
    { size: 320, left: 6, top: 10, delay: -6, duration: 22 },
    { size: 240, left: 74, top: 6, delay: -12, duration: 18 },
    { size: 280, left: 58, top: 64, delay: -3, duration: 26 },
    { size: 170, left: 2, top: 78, delay: -9, duration: 16 },
    { size: 210, left: 84, top: 46, delay: -15, duration: 20 },
    { size: 170, left: 36, top: 28, delay: -1, duration: 24 },
  ];

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected onMouseMove(event: MouseEvent): void {
    if (this.reduceMotion) {
      return;
    }
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    this.blobEls().forEach((ref, index) => {
      const speed = (index + 1) * 18;
      ref.nativeElement.style.marginLeft = `${x * speed}px`;
      ref.nativeElement.style.marginTop = `${y * speed}px`;
    });
  }

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
