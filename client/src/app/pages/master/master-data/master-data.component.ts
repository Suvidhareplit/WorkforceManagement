import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../layout/layout.component';

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <h1 class="text-3xl font-bold text-gray-900">Master Data</h1>
      <p class="mt-4 text-gray-600">This page will manage master data (cities, clusters, roles, etc.).</p>
    </app-layout>
  `
})
export class MasterDataComponent {}