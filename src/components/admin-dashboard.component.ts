import { Component, signal, input, output, effect, ElementRef, ViewChild, inject, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersistenceService, AnalyticPoint } from '../services/persistence.service';
import { LocalDbService } from '../services/local-db.service';
import * as d3 from 'd3';

type Tab = 'overview' | 'videos' | 'pdfs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-[1400px] mx-auto p-4 md:p-8 animate-[fadeIn_0.8s_ease-out]">
      <!-- Main Glass Container -->
      <div class="bg-black/80 border border-gold-500/20 rounded-2xl backdrop-blur-2xl shadow-2xl overflow-hidden relative">
        
        <!-- Ambient Background Glow -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        <!-- Header Section -->
        <div class="p-6 md:p-8 border-b border-gold-500/10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-2 h-8 bg-gold-500 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
              <h2 class="text-2xl md:text-3xl font-serif text-white tracking-wide">
                <span class="text-gold-400">ADMIN</span> CONSOLE
              </h2>
            </div>
            <p class="text-xs font-mono text-neutral-500 pl-5 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM ONLINE // ENCRYPTED
            </p>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-lg border border-white/5 backdrop-blur-md">
             <button 
               *ngFor="let tab of tabs"
               (click)="activeTab.set(tab.id)"
               [class]="activeTab() === tab.id 
                 ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' 
                 : 'text-neutral-400 hover:text-white hover:bg-white/5'"
               class="px-5 py-2 text-xs font-mono font-bold rounded-md transition-all duration-300 flex items-center gap-2"
             >
                <span [innerHTML]="tab.icon"></span>
                {{ tab.label }}
             </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 md:p-8 relative z-10 min-h-[600px]">
          
          <!-- OVERVIEW TAB -->
          @if (activeTab() === 'overview') {
            <div class="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              <!-- Key Metrics Grid -->
              <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                 <!-- Metric Card 1 -->
                 <div class="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-5 rounded-xl group hover:border-gold-500/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                      <p class="text-[10px] font-mono text-gold-500/80 uppercase tracking-widest">Total Traffic</p>
                      <svg class="w-4 h-4 text-gold-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <p class="text-3xl md:text-4xl font-mono text-white mb-2">{{ persistence.totalVisits() | number }}</p>
                    <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-gold-500 w-[75%] shadow-[0_0_10px_#D4AF37]"></div>
                    </div>
                 </div>

                 <!-- Metric Card 2 -->
                 <div class="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-5 rounded-xl group hover:border-gold-500/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                      <p class="text-[10px] font-mono text-gold-500/80 uppercase tracking-widest">Active Users</p>
                      <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    </div>
                    <p class="text-3xl md:text-4xl font-mono text-white mb-2">{{ persistence.activeUsers() | number }}</p>
                    <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-gold-500 w-[45%]"></div>
                    </div>
                 </div>

                 <!-- Metric Card 3 -->
                 <div class="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-5 rounded-xl group hover:border-gold-500/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                      <p class="text-[10px] font-mono text-gold-500/80 uppercase tracking-widest">Database Nodes</p>
                       <svg class="w-4 h-4 text-gold-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                    </div>
                    <p class="text-3xl md:text-4xl font-mono text-white mb-2">{{ pdfs().length + videos().length }}</p>
                    <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-gold-500 w-[60%]"></div>
                    </div>
                 </div>

                 <!-- Metric Card 4 -->
                 <div class="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-5 rounded-xl group hover:border-gold-500/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                      <p class="text-[10px] font-mono text-gold-500/80 uppercase tracking-widest">Storage Load</p>
                      <svg class="w-4 h-4 text-gold-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                    </div>
                    <p class="text-3xl md:text-4xl font-mono text-white mb-2">12<span class="text-lg text-neutral-500">%</span></p>
                    <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-gold-500 w-[12%]"></div>
                    </div>
                 </div>
              </div>

              <!-- Charts & Logs Layout -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
                <!-- D3 Main Chart -->
                <div class="lg:col-span-2 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col relative overflow-hidden">
                   <div class="flex justify-between items-center mb-6">
                     <h3 class="text-sm font-mono text-white font-bold flex items-center gap-2">
                       <span class="w-1 h-4 bg-gold-500"></span>
                       TRAFFIC ANALYSIS (72H)
                     </h3>
                     <div class="text-[10px] text-neutral-500 font-mono bg-white/5 px-2 py-1 rounded">LIVE FEED</div>
                   </div>
                   <!-- D3 Container -->
                   <div #chartContainer class="w-full flex-1 min-h-[300px] lg:min-h-0"></div>
                   
                   <!-- Grid Background Decoration -->
                   <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMCAwTDQwIDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>
                </div>

                <!-- System Logs -->
                <div class="bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col h-[400px] lg:h-auto">
                   <h3 class="text-sm font-mono text-white font-bold mb-4 flex items-center gap-2">
                      <span class="w-1 h-4 bg-neutral-600"></span>
                      SYSTEM LOGS
                   </h3>
                   <div class="flex-1 overflow-y-auto space-y-0.5 font-mono text-[10px] custom-scrollbar pr-2">
                     @for (log of logs; track $index) {
                       <div class="flex gap-2 p-2 rounded hover:bg-white/5 transition-colors border-l border-transparent hover:border-gold-500/50">
                         <span class="text-neutral-500 whitespace-nowrap">{{ log.time }}</span>
                         <span [class]="log.type === '警告' ? 'text-red-400' : 'text-green-400'" class="w-8 text-center bg-white/5 rounded">{{ log.type }}</span>
                         <span class="text-neutral-300 truncate">{{ log.msg }}</span>
                       </div>
                     }
                   </div>
                </div>
              </div>
            </div>
          }

          <!-- MANAGEMENT TABS (Shared Layout for PDF & Video) -->
          @if (activeTab() === 'videos' || activeTab() === 'pdfs') {
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-[fadeIn_0.4s_ease-out]">
              
              <!-- Upload Area (Sticky on Desktop) -->
              <div class="xl:col-span-1">
                <div 
                  class="bg-gradient-to-b from-white/5 to-transparent border border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative group overflow-hidden sticky top-24"
                  [class.border-gold-500]="isDragging()"
                  [class.bg-white-10]="isDragging()"
                  [class.shadow-glow-gold]="isDragging()"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event, activeTab() === 'videos' ? 'video' : 'pdf')"
                >
                  <!-- Background Pulse on Hover/Drag -->
                  <div class="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <input type="file" #fileInput class="hidden" 
                         [accept]="activeTab() === 'videos' ? 'video/mp4,video/quicktime,video/webm' : 'application/pdf'" 
                         (change)="onFileSelected($event, activeTab() === 'videos' ? 'video' : 'pdf')">
                  
                  @if (!isUploading()) {
                    <div class="w-20 h-20 rounded-full bg-black border border-gold-500/30 flex items-center justify-center mb-6 text-gold-400 group-hover:scale-110 group-hover:border-gold-500 transition-all duration-300 shadow-xl relative z-10">
                      @if (activeTab() === 'videos') {
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      } @else {
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      }
                    </div>
                    
                    <h3 class="text-white font-serif text-lg mb-2 relative z-10">Upload New {{ activeTab() === 'videos' ? 'Video' : 'Document' }}</h3>
                    <p class="text-neutral-500 text-xs font-mono mb-8 relative z-10 leading-relaxed max-w-[200px]">
                      Drag and drop your secure files here or click to browse.
                      <br><span class="text-gold-500/50 mt-2 block">{{ activeTab() === 'videos' ? 'MP4, WebM (Max 2GB)' : 'PDF (Encrypted)' }}</span>
                    </p>
                    
                    <button (click)="fileInput.click()" class="px-8 py-3 bg-gold-600 hover:bg-gold-500 hover:shadow-glow-gold text-black font-bold font-mono text-xs tracking-wider uppercase rounded transition-all transform hover:-translate-y-1 relative z-10">
                      Select File
                    </button>
                  } @else {
                    <div class="w-full relative z-10">
                      <div class="flex justify-between text-xs font-mono text-gold-400 mb-2">
                        <span>ENCRYPTING STREAM...</span>
                        <span>{{ uploadProgress }}%</span>
                      </div>
                      <div class="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gold-500 transition-all duration-100 ease-out shadow-[0_0_10px_#D4AF37]" [style.width]="uploadProgress + '%'"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Resource List -->
              <div class="xl:col-span-2 space-y-6">
                <div class="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 class="text-xs font-mono text-neutral-400 font-bold tracking-widest uppercase">
                    {{ activeTab() === 'videos' ? 'Video Archive' : 'Document Repository' }} 
                    <span class="text-gold-500">({{ (activeTab() === 'videos' ? videos() : pdfs()).length }})</span>
                  </h3>
                  <!-- Sort/Filter placeholder -->
                  <div class="flex gap-2">
                    <button class="p-1.5 text-neutral-600 hover:text-gold-500 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg></button>
                  </div>
                </div>

                <div class="space-y-3">
                  @for (item of (activeTab() === 'videos' ? videos() : pdfs()); track item.id) {
                    <div class="bg-black/40 border border-white/5 p-4 rounded-lg flex items-center justify-between group hover:border-gold-500/30 hover:bg-white/5 transition-all duration-200">
                       <div class="flex items-center gap-4 md:gap-6 overflow-hidden">
                          <!-- Icon Box -->
                          <div class="w-12 h-12 bg-neutral-900/50 border border-white/5 rounded-lg flex-shrink-0 flex items-center justify-center text-neutral-500 group-hover:text-gold-500 group-hover:border-gold-500/20 transition-colors">
                             @if (activeTab() === 'videos') {
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                             } @else {
                               <span class="font-mono text-[10px] font-bold">PDF</span>
                             }
                          </div>
                          
                          <!-- Metadata -->
                          <div class="min-w-0">
                            <h4 class="text-neutral-200 text-sm font-medium font-sans truncate group-hover:text-white transition-colors">{{ item.title }}</h4>
                            <div class="flex items-center gap-3 mt-1">
                              <span class="text-[10px] font-mono text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">{{ item.size }}</span>
                              @if (item.duration) {
                                <span class="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                  {{ item.duration }}
                                </span>
                              }
                            </div>
                          </div>
                       </div>
                       
                       <!-- Actions -->
                       <div class="flex items-center pl-4 border-l border-white/5 ml-4">
                         <button 
                           (click)="deleteResource.emit({type: activeTab() === 'videos' ? 'video' : 'pdf', id: item.id})" 
                           class="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                           title="Delete Resource"
                         >
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                       </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  `]
})
export class AdminDashboardComponent implements OnDestroy, AfterViewInit {
  persistence = inject(PersistenceService);
  localDb = inject(LocalDbService);
  
  pdfs = input.required<any[]>();
  videos = input.required<any[]>();
  
  deleteResource = output<{type: 'pdf' | 'video', id: string}>();
  addResource = output<{type: 'pdf' | 'video', item: any}>();

  activeTab = signal<Tab>('overview');
  isUploading = signal(false);
  isDragging = signal(false);
  uploadProgress = 0;

  @ViewChild('chartContainer') chartContainer?: ElementRef<HTMLElement>;
  private resizeObserver: ResizeObserver | null = null;

  tabs: {id: Tab, label: string, icon: string}[] = [
    { id: 'overview', label: 'Overview', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>' },
    { id: 'videos', label: 'Videos', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>' },
    { id: 'pdfs', label: 'Documents', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' }
  ];

  logs = Array.from({length: 20}, (_, i) => ({
    time: `10:${30 + i}:05`,
    type: Math.random() > 0.8 ? '警告' : '信息',
    msg: `IP 192.168.0.${Math.floor(Math.random()*255)} Accessed /secure/resource/${Math.floor(Math.random()*9000)+1000}`
  }));

  constructor() {
    effect(() => {
      if (this.activeTab() === 'overview') {
        setTimeout(() => this.initChart(), 50);
      } else {
        this.disconnectObserver();
      }
    });
  }

  ngAfterViewInit() {
    if(this.activeTab() === 'overview') {
       this.initChart();
    }
  }

  ngOnDestroy() {
    this.disconnectObserver();
  }

  disconnectObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  initChart() {
    if (!this.chartContainer) return;
    
    // Initial Render
    this.renderChart();

    // Setup Observer for responsiveness
    this.disconnectObserver();
    this.resizeObserver = new ResizeObserver(() => {
       requestAnimationFrame(() => this.renderChart());
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  renderChart() {
    if (!this.chartContainer) return;
    const data = this.persistence.getTrafficData();
    const element = this.chartContainer.nativeElement;
    
    // Ensure element has dimensions before drawing
    if (element.clientWidth === 0 || element.clientHeight === 0) return;

    d3.select(element).selectAll('*').remove();

    const margin = {top: 20, right: 10, bottom: 30, left: 40};
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${element.clientWidth} ${element.clientHeight}`)
      .attr('preserveAspectRatio', 'none')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 100])
      .range([height, 0]);

    const area = d3.area<AnalyticPoint>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'areaGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#D4AF37').attr('stop-opacity', 0.5);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#D4AF37').attr('stop-opacity', 0);

    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#areaGradient)')
      .attr('stroke', '#D4AF37')
      .attr('stroke-width', 2)
      .attr('d', area);

    // Axes with custom styling
    const xAxis = d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10);
    const yAxis = d3.axisLeft(y).ticks(5).tickSize(-width).tickPadding(10);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .style('color', '#666')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .select('.domain').remove();

    svg.append('g')
      .attr('class', 'grid-y')
      .call(yAxis)
      .style('color', '#333')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .select('.domain').remove();
    
    // Style the grid lines
    svg.selectAll('.grid-y line')
      .attr('stroke', 'rgba(255,255,255,0.05)')
      .attr('stroke-dasharray', '2,2');
  }

  // File Handling (Same logic as before)
  onFileSelected(event: any, type: 'pdf' | 'video') {
    const file = event.target.files[0];
    if (file) {
      this.handleRealUpload(file, type);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent, type: 'pdf' | 'video') {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleRealUpload(file, type);
    }
  }

  handleRealUpload(file: File, type: 'pdf' | 'video') {
    if (this.isUploading()) return;
    this.isUploading.set(true);
    this.uploadProgress = 0;

    const interval = setInterval(() => {
      this.uploadProgress += 5;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        
        this.saveToDb(file, type).then(item => {
           this.isUploading.set(false);
           this.addResource.emit({
             type,
             item: {
               ...item,
               url: URL.createObjectURL(file) 
             }
           });
        });
      }
    }, 50);
  }

  async saveToDb(file: File, type: 'pdf' | 'video') {
    const id = Date.now().toString();
    const size = this.formatBytes(file.size);
    const item = {
      id,
      type,
      title: file.name,
      description: 'Persistent Local Storage',
      size,
      duration: type === 'video' ? 'Unknown' : undefined,
      blob: file,
      createdAt: Date.now()
    };
    
    await this.localDb.addResource(item);
    return item;
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}