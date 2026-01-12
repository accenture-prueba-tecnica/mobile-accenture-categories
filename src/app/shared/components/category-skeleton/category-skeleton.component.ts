import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente skeleton para mostrar mientras se cargan las categorías
 * Implementa un placeholder animado que simula el diseño de las tarjetas de categoría
 */
@Component({
  selector: 'app-category-skeleton',
  templateUrl: './category-skeleton.component.html',
  styleUrls: ['./category-skeleton.component.scss'],
  imports: [CommonModule]
})
export class CategorySkeletonComponent {
  /** Número de skeletons a mostrar */
  @Input() count: number = 6;
  
  /** Array para iterar en el template */
  protected get skeletonArray(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}
