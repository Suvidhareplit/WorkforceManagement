import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../layout/layout.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
      <p class="mt-4 text-gray-600">This page will display analytics and reports.</p>
    </app-layout>
  `
})
export class AnalyticsComponent {}