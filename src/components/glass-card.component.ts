import { Component, ElementRef, HostListener, Input, ViewChild, input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  template: `
    <div 
      #card
      class="relative group rounded-xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 transition-all duration-500 ease-out hover:border-gold-500/60 hover:shadow-glow-gold-lg hover:-translate-y-3"
      (mousemove)="handleMouseMove($event)"
      (mouseleave)="handleMouseLeave()"
    >
      <!-- Spotlight Gradient -->
      <div 
        class="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        [style.background]="spotlightStyle"
      ></div>

      <!-- Content -->
      <div class="relative z-10 p-6 h-full flex flex-col transition-transform duration-500 ease-out group-hover:scale-105">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class GlassCardComponent {
  spotlightStyle = '';

  handleMouseMove(e: MouseEvent) {
    const card = (e.currentTarget as HTMLElement);
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Increased opacity to 0.4 for a much more pronounced spotlight
    this.spotlightStyle = `radial-gradient(600px circle at ${x}px ${y}px, rgba(212, 175, 55, 0.4), transparent 40%)`;
  }

  handleMouseLeave() {
    this.spotlightStyle = '';
  }
}