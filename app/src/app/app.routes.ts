import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'alerts' },
  {
    path: 'alerts',
    loadComponent: () =>
      import('./features/alerts/alerts-page').then((m) => m.AlertsPageComponent),
  },
  {
    path: 'admin',
    // TODO: roleGuard (admin custom claim)
    loadComponent: () => import('./features/admin/admin-page').then((m) => m.AdminPageComponent),
  },
];
