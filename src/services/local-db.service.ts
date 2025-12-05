import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface DbResource {
  id: string;
  type: 'pdf' | 'video';
  title: string;
  description: string;
  size: string;
  duration?: string;
  path?: string;
  createdAt: number;
  url?: string;
}

const API_URL = environment.apiUrl || '';

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  private http = inject(HttpClient);

  constructor() {}

  async init(): Promise<void> {
    // No-op for API version
    return Promise.resolve();
  }

  async addResource(resource: any): Promise<void> {
    const formData = new FormData();
    formData.append('file', resource.blob); // Assume blob is the File object
    formData.append('type', resource.type);
    
    // We don't send other metadata as backend generates it, but if needed we could
    // For now backend generates ID, size, etc.
    
    return firstValueFrom(this.http.post(`${API_URL}/api/resources`, formData)).then(() => {});
  }

  async getAllResources(): Promise<DbResource[]> {
    return firstValueFrom(this.http.get<any[]>(`${API_URL}/api/resources`).pipe(
      map(items => items.map(item => ({
        ...item,
        createdAt: item.created_at * 1000, // Backend timestamp is likely seconds? I used time.time() which is float seconds
        // Frontend expects ms?
        // Let's check backend model: time.time() returns seconds.
        // JS Date uses ms. So * 1000 is correct if I used time.time()
        // Wait, I should check my python code. Yes time.time()
      })))
    ));
  }

  async deleteResource(id: string): Promise<void> {
    return firstValueFrom(this.http.delete(`${API_URL}/api/resources/${id}`)).then(() => {});
  }
}
