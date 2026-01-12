import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';

/**
 * Componente presentacional para la búsqueda de categorías
 * Maneja la entrada de búsqueda con signals
 */
@Component({
  selector: 'app-category-search',
  templateUrl: './category-search.component.html',
  styleUrls: ['./category-search.component.scss'],
  imports: [IonIcon]
})
export class CategorySearchComponent {
  @Input() set value(val: string) {
    this.searchTerm.set(val);
  }
  
  @Output() searchChange = new EventEmitter<string>();
  
  protected readonly searchTerm = signal<string>('');

  constructor() {
    addIcons({ search });
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.searchTerm.set(value);
    this.searchChange.emit(value);
  }
}
