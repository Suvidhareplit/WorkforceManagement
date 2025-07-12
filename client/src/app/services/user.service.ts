import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  managerId?: number;
  cityId?: number;
  clusterId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  managerId?: number;
  cityId?: number;
  clusterId?: number;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>('/api/users', user);
  }

  updateUser(id: number, user: Partial<CreateUserRequest>): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}