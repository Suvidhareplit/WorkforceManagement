import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutComponent } from '../../../layout/layout.component';
import { UserService, User, CreateUserRequest } from '../../../services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
          <button 
            (click)="showCreateForm = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add New User
          </button>
        </div>

        <!-- Create User Form -->
        <div *ngIf="showCreateForm" class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Create New User</h2>
          
          <form [formGroup]="userForm" (ngSubmit)="createUser()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                formControlName="name"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">User ID</label>
              <input 
                type="text" 
                formControlName="userId"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                formControlName="email"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone</label>
              <input 
                type="tel" 
                formControlName="phone"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select 
                formControlName="role"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="manager">Manager</option>
                <option value="recruiter">Recruiter</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                formControlName="password"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div class="md:col-span-2 flex justify-end space-x-3">
              <button 
                type="button"
                (click)="cancelCreate()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="userForm.invalid"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                Create User
              </button>
            </div>
          </form>
        </div>

        <!-- Users Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">All Users</h2>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cluster</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let user of users$ | async">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.userId }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.phone || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.managerId || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.cityId || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.clusterId || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                    <button class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users$: Observable<User[]>;
  userForm: FormGroup;
  showCreateForm = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      userId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.users$ = this.userService.getUsers();
  }

  ngOnInit(): void {}

  createUser(): void {
    if (this.userForm.valid) {
      const userData: CreateUserRequest = this.userForm.value;
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.users$ = this.userService.getUsers(); // Refresh users list
          this.cancelCreate();
        },
        error: (error) => {
          console.error('Error creating user:', error);
        }
      });
    }
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.userForm.reset();
  }
}