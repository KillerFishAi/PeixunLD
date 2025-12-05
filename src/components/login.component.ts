import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      
      <div class="w-full max-w-md p-8 bg-black/80 border border-gold-500/20 rounded-2xl backdrop-blur-2xl shadow-2xl relative z-10">
        <div class="text-center mb-8">
           <h2 class="text-3xl font-serif text-white tracking-wide mb-2">
            <span class="text-gold-400">ADMIN</span> ACCESS
           </h2>
           <p class="text-neutral-500 text-xs font-mono">SECURE LOGIN REQUIRED</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-xs font-mono text-gold-500 mb-2">USERNAME</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username" 
              class="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-gold-500 focus:outline-none transition-colors"
              placeholder="Enter username"
            >
          </div>
          
          <div>
            <label class="block text-xs font-mono text-gold-500 mb-2">PASSWORD</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              class="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-gold-500 focus:outline-none transition-colors"
              placeholder="Enter password"
            >
          </div>

          @if (error) {
            <div class="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-xs font-mono">
              {{ error }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="isLoading"
            class="w-full py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold font-mono text-xs tracking-wider uppercase rounded transition-all transform hover:-translate-y-1"
          >
            {{ isLoading ? 'AUTHENTICATING...' : 'LOGIN' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
  username = '';
  password = '';
  error = '';
  isLoading = false;

  onSubmit() {
    this.isLoading = true;
    this.error = '';
    
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        // Navigation handled in service
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Invalid credentials. Access denied.';
        console.error(err);
      }
    });
  }
}
