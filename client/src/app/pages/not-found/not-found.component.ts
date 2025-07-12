import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../layout/layout.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">404</h1>
        <p class="text-xl text-gray-600">Page not found</p>
      </div>
    </app-layout>
  `
})
export class NotFoundComponent {}