import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - Blue Collar HRMS'
  },
  { path: 'hiring/create', loadComponent: () => import('./pages/hiring/create-hiring-request/create-hiring-request.component').then(m => m.CreateHiringRequestComponent) },
  { path: 'hiring/requests', loadComponent: () => import('./pages/hiring/view-hiring-requests/view-hiring-requests.component').then(m => m.ViewHiringRequestsComponent) },
  { path: 'interviews/applications', loadComponent: () => import('./pages/interviews/candidate-application/candidate-application.component').then(m => m.CandidateApplicationComponent) },
  { path: 'interviews/prescreening', loadComponent: () => import('./pages/interviews/prescreening/prescreening.component').then(m => m.PrescreeningComponent) },
  { path: 'interviews/technical', loadComponent: () => import('./pages/interviews/technical-round/technical-round.component').then(m => m.TechnicalRoundComponent) },
  { path: 'interviews/offers', loadComponent: () => import('./pages/interviews/offer-management/offer-management.component').then(m => m.OfferManagementComponent) },
  { path: 'training/induction', loadComponent: () => import('./pages/training/induction-training/induction-training.component').then(m => m.InductionTrainingComponent) },
  { path: 'training/classroom', loadComponent: () => import('./pages/training/classroom-training/classroom-training.component').then(m => m.ClassroomTrainingComponent) },
  { path: 'training/field', loadComponent: () => import('./pages/training/field-training/field-training.component').then(m => m.FieldTrainingComponent) },
  { path: 'employees/lifecycle', loadComponent: () => import('./pages/employee/employee-lifecycle/employee-lifecycle.component').then(m => m.EmployeeLifecycleComponent) },
  { path: 'employees/exit', loadComponent: () => import('./pages/employee/exit-management/exit-management.component').then(m => m.ExitManagementComponent) },
  { path: 'master-data', loadComponent: () => import('./pages/master/master-data/master-data.component').then(m => m.MasterDataComponent) },
  { path: 'management/users', loadComponent: () => import('./pages/management/user-management/user-management.component').then(m => m.UserManagementComponent) },
  { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics/analytics.component').then(m => m.AnalyticsComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];