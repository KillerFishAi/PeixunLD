import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black animate-cinematic-enter">
      <!-- Close Button -->
      <button 
        (click)="close.emit()" 
        class="absolute top-8 right-8 text-white/50 hover:text-gold-400 transition-colors z-50 p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <!-- Viewer Container -->
      <div class="w-full h-full max-w-6xl max-h-[90vh] p-4 flex flex-col items-center">
        <!-- Header -->
        <div class="w-full flex justify-between items-center mb-4 px-2">
             <h2 class="text-gold-100 font-serif text-2xl tracking-widest truncate max-w-[70%]">{{ title() }}</h2>
             
             @if (url()) {
               <a 
                 [href]="url()" 
                 [download]="title() + '.pdf'"
                 class="flex items-center gap-2 px-4 py-2 bg-gold-600/20 hover:bg-gold-600/40 text-gold-400 border border-gold-500/30 rounded transition-colors text-xs font-mono uppercase tracking-wider"
               >
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Download
               </a>
             }
        </div>
        
        <div class="w-full flex-1 bg-white/5 border border-gold-500/20 shadow-glow-gold rounded-lg overflow-hidden relative">
          
          @if (url()) {
            <!-- Real PDF Object -->
            <object [data]="url()" type="application/pdf" class="w-full h-full">
                <div class="flex items-center justify-center h-full text-neutral-400 font-mono flex-col gap-4">
                  <p>无法在应用内直接预览 PDF。</p>
                  <a [href]="url()" target="_blank" class="text-gold-400 hover:underline">点击此处在新窗口打开</a>
                </div>
            </object>
          } @else {
            <!-- Mock Content for Demo items -->
            <div class="absolute inset-0 flex flex-col">
              <!-- Toolbar -->
              <div class="h-12 bg-neutral-900 border-b border-white/10 flex items-center justify-between px-4">
                 <span class="text-xs text-neutral-400 font-mono">PAGE 1 / 24</span>
                 <div class="flex gap-4 text-neutral-400">
                   <button class="hover:text-gold-400">-</button>
                   <span class="text-xs font-mono">100%</span>
                   <button class="hover:text-gold-400">+</button>
                 </div>
              </div>
              <div class="flex-1 bg-neutral-800 flex items-center justify-center overflow-auto p-8">
                <div class="bg-white w-[600px] h-[850px] shadow-2xl p-12 text-black font-serif">
                  <h1 class="text-3xl font-bold border-b-2 border-black pb-4 mb-8 text-center">{{ title() }}</h1>
                  <p class="mb-4 leading-relaxed text-justify">
                    [DEMO MODE] CONTENT PLACEHOLDER.
                  </p>
                  <p class="mb-4 leading-relaxed text-justify text-neutral-600">
                    This represents a secure document that has not been decrypted for public view.
                  </p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes cinematicScale {
      0% {
        opacity: 0;
        transform: scale(0.96);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-cinematic-enter {
      animation: cinematicScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class PdfReaderComponent {
  title = input.required<string>();
  url = input<any>();
  close = output<void>();
}