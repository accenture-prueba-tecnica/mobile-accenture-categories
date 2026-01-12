import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { IonActionSheet } from '@ionic/angular/standalone';
import { CategoryWithCount, CategoryActionConfig } from '../../../core/models/category.model';

/**
 * Componente presentacional para el action sheet de opciones de categoría
 * Muestra opciones para editar y eliminar categorías
 */
@Component({
  selector: 'app-category-options',
  templateUrl: './category-options.component.html',
  styleUrls: ['./category-options.component.scss'],
  imports: [IonActionSheet]
})
export class CategoryOptionsComponent {
  @Input({ required: true }) isOpen: boolean = false;
  @Input() selectedCategory: CategoryWithCount | null = null;
  
  @Output() dismiss = new EventEmitter<void>();
  @Output() editCategory = new EventEmitter<CategoryWithCount>();
  @Output() deleteCategory = new EventEmitter<CategoryWithCount>();

  protected get actionSheetButtons(): CategoryActionConfig[] {
    return [
      {
        text: 'Editar Nombre/Icono',
        handler: () => {
          if (this.selectedCategory) {
            this.editCategory.emit(this.selectedCategory);
          }
        }
      },
      {
        text: 'Eliminar Categoría',
        role: 'destructive',
        handler: () => {
          if (this.selectedCategory) {
            this.deleteCategory.emit(this.selectedCategory);
          }
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ];
  }

  protected handleDismiss(): void {
    this.dismiss.emit();
  }
}
