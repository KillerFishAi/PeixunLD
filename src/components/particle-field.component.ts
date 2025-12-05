import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-particle-field',
  standalone: true,
  template: `
    <canvas #canvas class="fixed top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen opacity-60"></canvas>
  `
})
export class ParticleFieldComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animationId: number = 0;
  private width = 0;
  private height = 0;
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initCanvas();
      this.animate();
      window.addEventListener('resize', this.resize.bind(this));
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animationId);
      window.removeEventListener('resize', this.resize.bind(this));
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    this.createParticles();
  }

  private resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvasRef.nativeElement.width = this.width;
    this.canvasRef.nativeElement.height = this.height;
  }

  private createParticles() {
    this.particles = [];
    const particleCount = Math.floor((this.width * this.height) / 15000); // Density
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.2 + 0.05,
        speedX: Math.random() * 0.2 - 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.8 ? '#FCF6BA' : '#D4AF37' // Mix of pale and deep gold
      });
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      
      // Reset if out of bounds
      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
    });
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
}