import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albumsOutline } from 'ionicons/icons';
import { CategoryWithCount } from '../../../core/models/category.model';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CategorySkeletonComponent } from '../category-skeleton/category-skeleton.component';

/**
 * Componente presentacional para mostrar una grilla de categorías
 * Maneja la visualización en formato grid responsive
 */
@Component({
  selector: 'app-category-grid',
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.scss'],
  imports: [CommonModule, IonIcon, CategoryCardComponent, CategorySkeletonComponent]
})
export class CategoryGridComponent {
  @Input({ required: true }) categories: CategoryWithCount[] = [];
  @Input() loading: boolean = false;
  
  @Output() categoryClick = new EventEmitter<CategoryWithCount>();
  @Output() categoryLongPress = new EventEmitter<{ category: CategoryWithCount; event: Event }>();

  constructor() {
    addIcons({ albumsOutline });
  }

  protected handleCategoryClick(category: CategoryWithCount): void {
    this.categoryClick.emit(category);
  }

  protected handleCategoryLongPress(data: { category: CategoryWithCount; event: Event }): void {
    this.categoryLongPress.emit(data);
  }
}
