import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-video-player',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black animate-cinematic-enter">
      <!-- Close Button -->
      <button 
        (click)="close.emit()" 
        class="absolute top-8 right-8 text-white/50 hover:text-gold-400 transition-colors z-50 p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <!-- Player Container -->
      <div class="w-full h-full max-w-7xl max-h-[90vh] p-4 flex flex-col items-center justify-center">
        <h2 class="text-gold-100 font-serif text-2xl mb-6 tracking-widest text-center">{{ title() }}</h2>
        
        <div class="w-full aspect-video bg-black border border-gold-500/20 shadow-glow-gold rounded-lg overflow-hidden relative group">
          
          @if (url()) {
            <!-- Real Video Player -->
             <video 
               [src]="url()" 
               controls 
               autoplay 
               class="w-full h-full object-contain"
             ></video>
          } @else {
            <!-- Mock Video UI (Fallback) -->
            <div class="absolute inset-0 flex items-center justify-center bg-neutral-900">
               <div class="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale')] bg-cover opacity-20"></div>
               <div class="w-20 h-20 rounded-full border border-gold-500/50 flex items-center justify-center text-gold-400 animate-pulse-slow z-10">
                  <svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               </div>
               <p class="absolute bottom-20 text-gold-500 font-mono text-sm">[模拟信号] 无真实源文件</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes cinematicScale {
      0% { opacity: 0; transform: scale(0.96); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-cinematic-enter {
      animation: cinematicScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class VideoPlayerComponent {
  title = input.required<string>();
  url = input<string>(); // New input for real file blob
  close = output<void>();
}