import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <h1 class="text-3xl font-bold text-center py-8">Blue Collar HRMS</h1>
      <div class="container mx-auto px-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .min-h-screen {
      min-height: 100vh;
    }
    .bg-gray-50 {
      background-color: #f9fafb;
    }
    .text-3xl {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }
    .font-bold {
      font-weight: 700;
    }
    .text-center {
      text-align: center;
    }
    .py-8 {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    .container {
      width: 100%;
      max-width: 1200px;
    }
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'Blue Collar HRMS';
}