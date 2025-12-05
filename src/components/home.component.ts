import { Component, signal, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ParticleFieldComponent } from './particle-field.component';
import { GlassCardComponent } from './glass-card.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { PdfReaderComponent } from './pdf-reader.component';
import { VideoPlayerComponent } from './video-player.component';
import { KonamiService } from '../services/konami.service';
import { PersistenceService } from '../services/persistence.service';
import { LocalDbService } from '../services/local-db.service';

interface Resource {
  id: string;
  title: string;
  description: string;
  size: string;
  url?: any; // Blob URL for real uploads
}

interface VideoResource extends Resource {
  duration?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    ParticleFieldComponent, 
    GlassCardComponent, 
    AdminDashboardComponent,
    PdfReaderComponent,
    VideoPlayerComponent
  ],
  template: `
<div class="relative min-h-screen font-sans selection:bg-gold-500 selection:text-black">
  <app-particle-field />
  
  <!-- Flash Overlay -->
  <div 
    class="fixed inset-0 z-[200] bg-gold-400 pointer-events-none transition-opacity duration-300 mix-blend-screen"
    [class.opacity-0]="!flash()"
    [class.opacity-40]="flash()"
  ></div>

  <!-- Navigation -->
  <nav class="fixed top-0 left-0 w-full z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer select-none">
         <!-- Recreated Logo based on 'D 联德培训' image -->
         <div class="relative w-12 h-12 flex items-center justify-center">
            <span class="text-5xl font-serif font-black italic text-transparent bg-clip-text bg-gradient-to-br from-gold-300 via-gold-100 to-gold-600 drop-shadow-sm transform -skew-x-12" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
              D
            </span>
         </div>
         <h1 class="text-3xl font-sans font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-300 to-gold-700 transform scale-y-90" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">
            联德培训
         </h1>
      </div>
      <div class="hidden md:flex items-center gap-8 text-sm font-mono text-neutral-400">
        <a href="#pdfs" class="hover:text-gold-400 transition-colors">文档资料</a>
        <a href="#videos" class="hover:text-gold-400 transition-colors">培训视频</a>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="relative z-10 pt-32 pb-20 px-6">
    
    <!-- Hero Section -->
    <header class="max-w-4xl mx-auto text-center mb-32">
      <p class="text-gold-500 font-mono text-xs tracking-[0.3em] mb-6 uppercase">LIANDE INSIGHT</p>
      <h2 class="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
        认知 · 决定 · <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">边界</span>
      </h2>
      <p class="text-neutral-400 text-lg md:text-xl font-sans max-w-2xl mx-auto leading-relaxed">
        投资不仅是资本的博弈，更是对未来的投票。
      </p>
    </header>

    <!-- Video Section -->
    <div id="videos" class="max-w-7xl mx-auto mb-20 scroll-mt-24">
      <div class="flex items-center gap-4 mb-8">
        <div class="h-[1px] bg-gold-500/30 flex-1"></div>
        <h3 class="text-gold-400 font-serif text-xl tracking-widest">培训视频</h3>
        <div class="h-[1px] bg-gold-500/30 flex-1"></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        @for (video of videoResources(); track video.id) {
          <app-glass-card class="h-full cursor-pointer group" (click)="openVideo(video)">
             <div class="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden mb-4 border border-white/10 group-hover:border-gold-500/50 transition-colors">
               <!-- Thumbnail logic -->
               @if (video.url) {
                 <!-- Show video tag for thumbnail preview if real -->
                 <video [src]="video.url" class="absolute inset-0 w-full h-full object-cover opacity-60"></video>
               } @else {
                  <div class="absolute inset-0 bg-[url('https://picsum.photos/800/450?grayscale')] bg-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"></div>
               }
               
               <div class="absolute inset-0 flex items-center justify-center">
                 <div class="w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-black transition-all">
                   <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 </div>
               </div>
               <div class="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-[10px] font-mono text-gold-200 rounded">
                 {{ video.duration || 'LIVE' }}
               </div>
             </div>
             <h3 class="text-lg font-serif text-white mb-2 group-hover:text-gold-200">{{ video.title }}</h3>
             <p class="text-xs text-neutral-400 leading-relaxed">{{ video.description }}</p>
          </app-glass-card>
        }
      </div>
    </div>

    <!-- PDF Resources Grid -->
    <div id="pdfs" class="max-w-7xl mx-auto scroll-mt-24">
      <div class="flex items-center gap-4 mb-8">
        <div class="h-[1px] bg-gold-500/30 flex-1"></div>
        <h3 class="text-gold-400 font-serif text-xl tracking-widest">文档资料</h3>
        <div class="h-[1px] bg-gold-500/30 flex-1"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (item of pdfResources(); track item.id) {
          <app-glass-card class="h-full cursor-pointer" (click)="openPdf(item)">
            <div class="flex flex-col h-full">
              <div class="flex justify-between items-start mb-6">
                <span class="px-2 py-1 bg-white/5 border border-white/10 text-[10px] font-mono text-gold-200 tracking-wider">PDF // 安全</span>
                <span class="text-neutral-500 text-xs font-mono">{{ item.size }}</span>
              </div>
              
              <h3 class="text-2xl font-serif text-white mb-3 group-hover:text-gold-200 transition-colors">{{ item.title }}</h3>
              <p class="text-sm text-neutral-400 leading-relaxed mb-8 flex-1">
                {{ item.description }}
              </p>

              <div class="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                <span class="text-xs font-mono text-neutral-500 group-hover:text-gold-400 transition-colors">访问文件 -></span>
                <div class="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold-500 group-hover:bg-gold-500/10 transition-colors">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
              </div>
            </div>
          </app-glass-card>
        }
      </div>
    </div>
  </main>

  <footer class="relative z-10 border-t border-white/5 py-12 bg-black">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="text-neutral-600 text-xs font-mono">
        &copy; 2025 LIANDE 高端资源库. 保留所有权利.
      </div>
      <div class="flex gap-6">
      </div>
    </div>
  </footer>

  <!-- PDF Modal -->
  @if (activePdf()) {
    <app-pdf-reader 
      [title]="activePdf()!.title" 
      [url]="activePdf()!.url"
      (close)="activePdf.set(null)" 
    />
  }

  <!-- Video Modal -->
  @if (activeVideo()) {
    <app-video-player
      [title]="activeVideo()!.title"
      [url]="activeVideo()!.url"
      (close)="activeVideo.set(null)"
    />
  }
</div>
  `,
})
export class HomeComponent implements OnInit {
  konami = inject(KonamiService);
  persistence = inject(PersistenceService);
  localDb = inject(LocalDbService);
  sanitizer = inject(DomSanitizer);
  
  flash = signal(false);
  
  activePdf = signal<Resource | null>(null);
  activeVideo = signal<VideoResource | null>(null);

  // Default Mock Data (fallback)
  private defaultPdfResources: Resource[] = [
    {
      id: '1',
      title: '高级企业战略',
      description: '解密高风险谈判与市场主导的方法论。卷1，共4卷。',
      size: '24.5 MB'
    },
    {
      id: '2',
      title: '领导力的炼金术',
      description: '将组织混乱转化为黄金机遇。现代CEO指南。',
      size: '18.2 MB'
    },
    {
      id: '3',
      title: '金融架构学',
      description: '动荡市场中可持续财富生成的蓝图。包含机密附件。',
      size: '32.1 MB'
    },
    {
      id: '4',
      title: '2025全球宏观趋势',
      description: '下一财年的预测分析与热力图投影。仅限内部使用。',
      size: '45.8 MB'
    },
    {
      id: '5',
      title: '数字化转型法典',
      description: '在传统基础设施中实施AI与神经网络。完整协议。',
      size: '12.4 MB'
    },
    {
      id: '6',
      title: '风险管理 Theta',
      description: '针对黑天鹅事件的高级对冲策略。包含数学模型。',
      size: '28.9 MB'
    }
  ];

  private defaultVideoResources: VideoResource[] = [
    {
      id: 'v1',
      title: '市场心理学：大师课',
      description: '分析群体行为与反向投资策略的深度讲座。',
      size: '1.4 GB',
      duration: '45:12'
    },
    {
      id: 'v2',
      title: '量子计算对金融的影响',
      description: '2024年闭门峰会录像，探讨加密技术的未来。',
      size: '2.1 GB',
      duration: '01:12:30'
    },
    {
      id: 'v3',
      title: '危机公关演练',
      description: '模拟突发舆情事件的应对流程与话术复盘。',
      size: '890 MB',
      duration: '28:45'
    }
  ];

  // Signals for state management
  pdfResources = signal<Resource[]>(this.defaultPdfResources);
  videoResources = signal<VideoResource[]>(this.defaultVideoResources);

  constructor() {
    effect(() => {
      // Keep flash effect if Konami triggered (maybe redirect to admin?)
      // For now just keep effect
      if (this.konami.isAdmin()) {
        this.flash.set(true);
        setTimeout(() => this.flash.set(false), 400);
        // Maybe navigate to login or admin?
      }
    });
    
    // Increment visit count on load
    this.persistence.incrementVisits();
  }

  async ngOnInit() {
    // Load persisted resources from Backend
    try {
      const dbResources = await this.localDb.getAllResources();
      
      const newPdfs: Resource[] = [];
      const newVideos: VideoResource[] = [];

      dbResources.forEach(res => {
        // Construct URL for backend
        const url = `/api/files/${res.path}`; // Backend serves files here
        const item = {
          id: res.id,
          title: res.title,
          description: res.description,
          size: res.size,
          duration: res.duration,
          url: url
        };

        if (res.type === 'pdf') newPdfs.push(item);
        else newVideos.push(item);
      });

      // Combine with defaults (Persisted items appear first)
      this.pdfResources.set([...newPdfs, ...this.defaultPdfResources]);
      this.videoResources.set([...newVideos, ...this.defaultVideoResources]);

    } catch (e) {
      console.error('Failed to load local DB resources', e);
    }
  }

  openPdf(resource: Resource) {
    // If it has a raw URL (blob/string), sanitize it if needed
    // Actually pdf-reader component handles it, but let's be safe
    // If it is from backend /api/files/..., it is a string.
    this.activePdf.set(resource);
  }

  openVideo(resource: VideoResource) {
    this.activeVideo.set(resource);
  }
}
