import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CategoryWithCount } from '../../../core/models/category.model';
import { addIcons } from 'ionicons';
import { 
  briefcase,
  home, 
  bulb, 
  person, 
  barbell,
  airplane,
  cart,
  school,
  heart,
  star,
  restaurant,
  film,
  musicalNote,
  football,
  colorPalette,
  code,
  paw,
  sunny,
  medkit,
  car
} from 'ionicons/icons';

/**
 * Componente presentacional para mostrar una tarjeta de categoría
 * Emite eventos de click y long press
 */
@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss'],
  imports: [IonIcon]
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: CategoryWithCount;
  @Input() taskCount: number = 0;
  
  @Output() categoryClick = new EventEmitter<CategoryWithCount>();
  @Output() categoryLongPress = new EventEmitter<{ category: CategoryWithCount; event: Event }>();

  constructor() {
    addIcons({ 
      work: briefcase,
      home, 
      lightbulb: bulb, 
      person, 
      fitness_center: barbell,
      flight: airplane,
      shopping_cart: cart,
      school,
      favorite: heart,
      star,
      restaurant,
      movie: film,
      music_note: musicalNote,
      sports_soccer: football,
      palette: colorPalette,
      code,
      pets: paw,
      beach_access: sunny,
      local_hospital: medkit,
      directions_car: car
    });
  }

  protected handleClick(): void {
    this.categoryClick.emit(this.category);
  }

  protected handleLongPress(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.categoryLongPress.emit({ category: this.category, event });
  }
}
