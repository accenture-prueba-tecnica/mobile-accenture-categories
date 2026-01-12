import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';
import { TaskHeaderConfig } from '../../../core/models/task.model';

/**
 * Componente presentacional para el header de la aplicación
 * Implementa las mejores prácticas de Angular 20 con signals y standalone components
 */
@Component({
  selector: 'app-task-header',
  templateUrl: './task-header.component.html',
  styleUrls: ['./task-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon
  ]
})
export class TaskHeaderComponent {
  /** Configuración del header mediante signal input */
  readonly config = input.required<TaskHeaderConfig>();
  
  /** Event emitter para el botón de retroceso */
  readonly backClick = output<void>();

  constructor() {
    addIcons({
      'chevron-back-outline': chevronBackOutline
    });
  }

  /**
   * Maneja el click en el botón de retroceso
   */
  protected onBackClick(): void {
    this.backClick.emit();
  }
}