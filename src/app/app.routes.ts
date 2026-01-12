import { Routes } from '@angular/router';
import { CategoriesPage } from './categories/categories.page';

export const routes: Routes = [
  {
    path: 'tareas',
    loadComponent: () => import('./tareas/tareas.page').then((m) => m.TareasPage),
  },
  {
    path: 'categories',
    component: CategoriesPage,
  },
  {
    path: '',
    redirectTo: 'categories',
    pathMatch: 'full',
  },
];
