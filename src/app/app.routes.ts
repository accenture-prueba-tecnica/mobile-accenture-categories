import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tareas',
    loadComponent: () => import('./tareas/tareas.page').then((m) => m.TareasPage),
  },
  {
    path: '',
    redirectTo: 'tareas',
    pathMatch: 'full',
  },
];
