import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KonamiService {
  private sequence = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a',
    'b', 'a'
  ];
  private currentInput: string[] = [];
  
  public isAdmin = signal<boolean>(false);

  constructor() {
    window.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleKeydown(event: KeyboardEvent) {
    this.currentInput.push(event.key);
    
    if (this.currentInput.length > this.sequence.length) {
      this.currentInput.shift();
    }

    if (JSON.stringify(this.currentInput) === JSON.stringify(this.sequence)) {
      this.activateGodMode();
      // Reset input to prevent multi-trigger without re-typing
      this.currentInput = [];
    }
  }

  private activateGodMode() {
    console.log('✨ KONAMI CODE ACTIVATED: ADMIN MODE ✨');
    this.isAdmin.update(val => !val);
  }
}