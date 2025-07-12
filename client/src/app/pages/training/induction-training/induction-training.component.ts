import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../layout/layout.component';

@Component({
  selector: 'app-induction-training',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <h1 class="text-3xl font-bold text-gray-900">Induction Training</h1>
      <p class="mt-4 text-gray-600">This page will manage induction training.</p>
    </app-layout>
  `
})
export class InductionTrainingComponent {}