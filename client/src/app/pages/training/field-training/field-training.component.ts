import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../layout/layout.component';

@Component({
  selector: 'app-field-training',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <h1 class="text-3xl font-bold text-gray-900">Field Training</h1>
      <p class="mt-4 text-gray-600">This page will manage field training programs.</p>
    </app-layout>
  `
})
export class FieldTrainingComponent {}