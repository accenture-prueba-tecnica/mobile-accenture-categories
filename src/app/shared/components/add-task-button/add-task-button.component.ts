import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

/**
 * Componente presentacional para el botón de agregar nueva tarea
 * Implementa el patrón de componente reutilizable con eventos claros
 */
@Component({
  selector: 'app-add-task-button',
  templateUrl: './add-task-button.component.html',
  styleUrls: ['./add-task-button.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon
  ]
})
export class AddTaskButtonComponent {
  /** Evento emitido cuando se hace click en agregar tarea */
  readonly addTaskClick = output<void>();

  constructor() {
    addIcons({
      'add-outline': addOutline
    });
  }

  /**
   * Maneja el click para agregar nueva tarea
   */
  protected onAddTaskClick(): void {
    this.addTaskClick.emit();
  }
}