import { Component, Output, EventEmitter } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

/**
 * Componente presentacional para el botón flotante de agregar categoría
 * Emite evento cuando se hace click
 */
@Component({
  selector: 'app-add-category-button',
  templateUrl: './add-category-button.component.html',
  styleUrls: ['./add-category-button.component.scss'],
  imports: [IonIcon]
})
export class AddCategoryButtonComponent {
  @Output() addCategoryClick = new EventEmitter<void>();

  constructor() {
    addIcons({ add });
  }

  protected handleClick(): void {
    this.addCategoryClick.emit();
  }
}
