import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

export interface AnalyticPoint {
  date: Date;
  value: number;
}

const API_URL = environment.apiUrl || '';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private http = inject(HttpClient);
  
  // Real-time signals
  totalVisits = signal<number>(0);
  activeUsers = signal<number>(0);
  chartData = signal<AnalyticPoint[]>([]);
  
  constructor() {
    this.loadData();
  }

  private loadData() {
    this.http.get<any>(`${API_URL}/api/analytics`).subscribe({
      next: (data) => {
        this.totalVisits.set(data.totalVisits);
        this.activeUsers.set(data.activeUsers);
        
        // Transform chart data
        const points = data.chartData.map((d: any) => ({
          date: new Date(d.date),
          value: d.value
        }));
        this.chartData.set(points);
      },
      error: (err) => console.error('Failed to load analytics', err)
    });
  }

  // Generate consistent 72-hour traffic data
  getTrafficData(): AnalyticPoint[] {
    return this.chartData();
  }

  incrementVisits() {
    this.http.post<any>(`${API_URL}/api/analytics/visit`, {}).subscribe(res => {
        this.totalVisits.set(res.totalVisits);
    });
  }
}
