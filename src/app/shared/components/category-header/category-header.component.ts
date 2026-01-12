import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { CategoryHeaderConfig } from '../../../core/models/category.model';

/**
 * Componente presentacional para el header de categorías
 * Muestra el título y botón de retroceso
 */
@Component({
  selector: 'app-category-header',
  templateUrl: './category-header.component.html',
  styleUrls: ['./category-header.component.scss'],
  imports: [IonButton, IonIcon]
})
export class CategoryHeaderComponent {
  @Input({ required: true }) config!: CategoryHeaderConfig;
  @Output() backClick = new EventEmitter<void>();

  constructor() {
    addIcons({ chevronBack });
  }

  protected handleBackClick(): void {
    this.backClick.emit();
  }
}
