import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../layout/layout.component';

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <h1 class="text-3xl font-bold text-gray-900">Offer Management</h1>
      <p class="mt-4 text-gray-600">This page will handle job offers.</p>
    </app-layout>
  `
})
export class OfferManagementComponent {}