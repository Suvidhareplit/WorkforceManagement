import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../layout/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Stats Cards -->
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">👥</div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-500">Total Employees</p>
                <p class="text-2xl font-semibold text-gray-900">1,247</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">📄</div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-500">Open Positions</p>
                <p class="text-2xl font-semibold text-gray-900">45</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">🎯</div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-500">Applications</p>
                <p class="text-2xl font-semibold text-gray-900">128</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">📚</div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-500">Training Sessions</p>
                <p class="text-2xl font-semibold text-gray-900">23</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Activities -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <p class="text-sm text-gray-600">New employee John Smith joined the company</p>
                <span class="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p class="text-sm text-gray-600">Training session "Safety Protocols" completed</p>
                <span class="text-xs text-gray-400">4 hours ago</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p class="text-sm text-gray-600">New hiring request for Warehouse Manager</p>
                <span class="text-xs text-gray-400">6 hours ago</span>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-4">
              <button class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div class="text-center">
                  <div class="text-2xl mb-2">➕</div>
                  <p class="text-sm font-medium">Add Employee</p>
                </div>
              </button>
              <button class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div class="text-center">
                  <div class="text-2xl mb-2">📋</div>
                  <p class="text-sm font-medium">New Hiring Request</p>
                </div>
              </button>
              <button class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div class="text-center">
                  <div class="text-2xl mb-2">🎓</div>
                  <p class="text-sm font-medium">Schedule Training</p>
                </div>
              </button>
              <button class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div class="text-center">
                  <div class="text-2xl mb-2">📊</div>
                  <p class="text-sm font-medium">View Reports</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}
}