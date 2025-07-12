import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h2>Dashboard</h2>
      <div class="stats-grid">
        <!-- Stats Cards -->
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <p class="stat-label">Total Employees</p>
            <p class="stat-value">1,247</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <p class="stat-label">Open Positions</p>
            <p class="stat-value">45</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <p class="stat-label">Applications</p>
            <p class="stat-value">128</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <p class="stat-label">Training Sessions</p>
            <p class="stat-value">23</p>
          </div>
        </div>
      </div>
      
      <div class="content-grid">
        <div class="card">
          <h3>Recent Activities</h3>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-dot green"></div>
              <p>New employee John Smith joined the company</p>
              <span class="activity-time">2 hours ago</span>
            </div>
            <div class="activity-item">
              <div class="activity-dot blue"></div>
              <p>Training session "Safety Protocols" completed</p>
              <span class="activity-time">4 hours ago</span>
            </div>
            <div class="activity-item">
              <div class="activity-dot yellow"></div>
              <p>New hiring request for Warehouse Manager</p>
              <span class="activity-time">6 hours ago</span>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3>Quick Actions</h3>
          <div class="actions-grid">
            <button class="action-btn">
              <div class="action-icon">➕</div>
              <p>Add Employee</p>
            </button>
            <button class="action-btn">
              <div class="action-icon">📋</div>
              <p>New Hiring Request</p>
            </button>
            <button class="action-btn">
              <div class="action-icon">🎓</div>
              <p>Schedule Training</p>
            </button>
            <button class="action-btn">
              <div class="action-icon">📊</div>
              <p>View Reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h2 {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      color: #1f2937;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
    }
    
    .stat-icon {
      font-size: 2rem;
      margin-right: 1rem;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 0.25rem 0;
    }
    
    .stat-value {
      font-size: 1.875rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    
    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    h3 {
      font-size: 1.125rem;
      font-weight: 500;
      color: #1f2937;
      margin: 0 0 1rem 0;
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .activity-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }
    
    .activity-dot.green { background-color: #10b981; }
    .activity-dot.blue { background-color: #3b82f6; }
    .activity-dot.yellow { background-color: #f59e0b; }
    
    .activity-item p {
      flex: 1;
      font-size: 0.875rem;
      color: #4b5563;
      margin: 0;
    }
    
    .activity-time {
      font-size: 0.75rem;
      color: #9ca3af;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .action-btn {
      padding: 1rem;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    
    .action-btn:hover {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }
    
    .action-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .action-btn p {
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0;
      color: #1f2937;
    }
  `]
})
export class DashboardComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}
}