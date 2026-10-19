import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'alerts' },
  {
    path: 'alerts',
    loadComponent: () => import('./features/alerts/alerts-page').then((m) => m.AlertsPageComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-page').then((m) => m.AdminPageComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/admin/admin-events-page').then((m) => m.AdminEventsPageComponent),
      },
    ],
  },
];
