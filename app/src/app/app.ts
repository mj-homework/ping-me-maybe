import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly authError = signal<string | null>(null);

  protected signIn(email: string, password: string): Promise<void> {
    return this.run(() => this.auth.signIn(email, password));
  }

  protected signUp(email: string, password: string): Promise<void> {
    return this.run(() => this.auth.signUp(email, password));
  }

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/alerts');
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.authError.set(null);
    try {
      await action();
    } catch (err) {
      this.authError.set(err instanceof Error ? err.message : String(err));
    }
  }
}
