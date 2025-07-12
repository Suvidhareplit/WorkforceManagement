import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-md">
        <div class="p-4">
          <h1 class="text-xl font-bold text-gray-800">Blue Collar HRMS</h1>
        </div>
        
        <nav class="mt-4">
          <div class="px-4 py-2">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</p>
          </div>
          
          <a routerLink="/" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Dashboard</span>
          </a>
          
          <div class="px-4 py-2 mt-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hiring</p>
          </div>
          
          <a routerLink="/hiring/create" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Create Request</span>
          </a>
          
          <a routerLink="/hiring/requests" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>View Requests</span>
          </a>
          
          <div class="px-4 py-2 mt-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Interviews</p>
          </div>
          
          <a routerLink="/interviews/applications" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Applications</span>
          </a>
          
          <a routerLink="/interviews/prescreening" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Prescreening</span>
          </a>
          
          <a routerLink="/interviews/technical" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Technical Round</span>
          </a>
          
          <a routerLink="/interviews/offers" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Offer Management</span>
          </a>
          
          <div class="px-4 py-2 mt-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Training</p>
          </div>
          
          <a routerLink="/training/induction" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Induction</span>
          </a>
          
          <a routerLink="/training/classroom" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Classroom</span>
          </a>
          
          <a routerLink="/training/field" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Field Training</span>
          </a>
          
          <div class="px-4 py-2 mt-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employees</p>
          </div>
          
          <a routerLink="/employees/lifecycle" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Lifecycle</span>
          </a>
          
          <a routerLink="/employees/exit" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Exit Management</span>
          </a>
          
          <div class="px-4 py-2 mt-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
          </div>
          
          <a routerLink="/master-data" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Master Data</span>
          </a>
          
          <a routerLink="/management/users" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>User Management</span>
          </a>
          
          <a routerLink="/analytics" 
             routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
             class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
            <span>Analytics</span>
          </a>
        </nav>
      </aside>
      
      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
          <div class="px-6 py-4 flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-gray-800">Dashboard</h2>
            
            <div class="flex items-center space-x-4" *ngIf="currentUser$ | async as user">
              <span class="text-sm text-gray-600">Welcome, {{ user.name }}</span>
              <button 
                (click)="logout()"
                class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <div class="p-6">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }
}