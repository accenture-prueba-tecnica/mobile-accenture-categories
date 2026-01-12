import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

import { CategoryWithCount, CategoryHeaderConfig } from '../core/models/category.model';
import { CategoryService } from '../core/services/category.service';
import { CategoryDialogService } from '../core/services/category-dialog.service';
import { FirebaseTaskService } from '../core/services/firebase-task.service';

// Componentes granulares
import { CategoryHeaderComponent } from '../shared/components/category-header/category-header.component';
import { CategorySearchComponent } from '../shared/components/category-search/category-search.component';
import { CategoryGridComponent } from '../shared/components/category-grid/category-grid.component';
import { AddCategoryButtonComponent } from '../shared/components/add-category-button/add-category-button.component';
import { CategoryOptionsComponent } from '../shared/components/category-options/category-options.component';

/**
 * Página de categorías que actúa como contenedor inteligente (Smart Component)
 * Coordina la interacción entre componentes presentacionales granulares
 * Implementa las mejores prácticas de Angular 20 con función inject y signals
 */
@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    CategoryHeaderComponent,
    CategorySearchComponent,
    CategoryGridComponent,
    AddCategoryButtonComponent,
    CategoryOptionsComponent
  ],
})
export class CategoriesPage {
  // Inyección usando la función inject (Angular 20 best practice)
  private readonly categoryService = inject(CategoryService);
  private readonly categoryDialogService = inject(CategoryDialogService);
  private readonly taskService = inject(FirebaseTaskService);
  private readonly router = inject(Router);

  /** Signal para la categoría seleccionada */
  protected readonly selectedCategory = signal<CategoryWithCount | null>(null);
  
  /** Signal para el estado del action sheet */
  protected readonly isActionSheetOpen = signal(false);
  
  /** Signal para el término de búsqueda */
  protected readonly searchTerm = signal<string>('');
  
  /** Configuración del header */
  protected readonly headerConfig: CategoryHeaderConfig = {
    title: 'Mis Tareas',
    showBackButton: false
  };
  
  /** Computed signal para categorías con contador de tareas */
  protected readonly categoriesWithCount = computed<CategoryWithCount[]>(() => {
    const categories = this.categoryService.categories();
    const tasks = this.taskService.tasks();
    
    // Contar tareas por categoría
    const taskCountMap = new Map<string, number>();
    tasks.forEach(task => {
      if (task.categoryId) {
        const count = taskCountMap.get(task.categoryId) || 0;
        taskCountMap.set(task.categoryId, count + 1);
      }
    });
    
    // Mapear categorías con contador
    return categories.map(category => ({
      ...category,
      taskCount: taskCountMap.get(category.id) || 0
    }));
  });
  
  /** Computed signal para categorías filtradas por búsqueda */
  protected readonly filteredCategories = computed<CategoryWithCount[]>(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const categories = this.categoriesWithCount();
    
    if (!search) {
      return categories;
    }
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(search)
    );
  });

  /**
   * Maneja el click en el botón de retroceso del header
   */
  protected onHeaderBackClick(): void {
    this.router.navigate(['/categories']);
  }

  /**
   * Maneja el cambio en el término de búsqueda
   */
  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * Maneja el click en una categoría
   */
  protected onCategoryClick(category: CategoryWithCount): void {
    // Navegar a la página de tareas filtradas por categoría
    this.router.navigate(['/tareas'], { 
      queryParams: { categoryId: category.id } 
    });
  }

  /**
   * Abre el action sheet para una categoría (long press)
   */
  protected onCategoryLongPress(data: { category: CategoryWithCount; event: Event }): void {
    data.event.stopPropagation();
    this.selectedCategory.set(data.category);
    this.isActionSheetOpen.set(true);
  }

  /**
   * Cierra el action sheet
   */
  protected onActionSheetDismiss(): void {
    this.isActionSheetOpen.set(false);
    setTimeout(() => {
      this.selectedCategory.set(null);
    }, 300);
  }

  /**
   * Inicia el proceso de agregar una nueva categoría
   */
  protected async onAddNewCategory(): Promise<void> {
    const categoryData = await this.categoryDialogService.showCreateCategoryDialog();
    
    if (categoryData) {
      this.categoryService.createCategory(categoryData);
    }
  }

  /**
   * Inicia el proceso de editar una categoría
   */
  protected async onEditCategory(category: CategoryWithCount): Promise<void> {
    this.isActionSheetOpen.set(false);
    
    const updateData = await this.categoryDialogService.showEditCategoryDialog(category.name);
    
    if (updateData) {
      this.categoryService.updateCategory(category.id, updateData);
    }
    
    this.selectedCategory.set(null);
  }

  /**
   * Inicia el proceso de eliminar una categoría
   */
  protected async onDeleteCategory(category: CategoryWithCount): Promise<void> {
    this.isActionSheetOpen.set(false);
    
    const confirmed = await this.categoryDialogService.showDeleteCategoryConfirmation(category.name);
    
    if (confirmed) {
      const success = this.categoryService.deleteCategory(category.id);
      
      if (!success) {
        await this.categoryDialogService.showErrorAlert(
          'No se pudo eliminar la categoría. Inténtalo de nuevo.'
        );
      }
    }
    
    this.selectedCategory.set(null);
  }
}
