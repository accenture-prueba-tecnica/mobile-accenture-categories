import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonActionSheet, ActionSheetButton } from '@ionic/angular/standalone';
import { Task, TaskActionConfig } from '../../../core/models/task.model';

/**
 * Componente presentacional para mostrar las opciones de una tarea
 * Encapsula la lógica del ActionSheet con configuración flexible
 */
@Component({
  selector: 'app-task-options',
  templateUrl: './task-options.component.html',
  styleUrls: ['./task-options.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonActionSheet
  ]
})
export class TaskOptionsComponent {
  /** Estado de visibilidad del action sheet */
  readonly isOpen = input.required<boolean>();
  
  /** Tarea seleccionada para mostrar opciones */
  readonly selectedTask = input<Task | null>(null);
  
  /** Configuraciones de acciones personalizables */
  readonly actionConfigs = input<TaskActionConfig[]>([]);
  
  /** Evento cuando se cierra el action sheet */
  readonly dismiss = output<void>();
  
  /** Evento cuando se selecciona editar tarea */
  readonly editTask = output<Task>();
  
  /** Evento cuando se selecciona eliminar tarea */
  readonly deleteTask = output<Task>();

  /** Computed signal para generar los botones del action sheet */
  protected readonly actionSheetButtons = computed<ActionSheetButton[]>(() => {
    const task = this.selectedTask();
    if (!task) return [];

    return [
      {
        text: 'Editar Tarea',
        icon: 'create-outline',
        handler: () => {
          this.editTask.emit(task);
          return true;
        }
      },
      {
        text: 'Eliminar Tarea',
        icon: 'trash-outline',
        role: 'destructive',
        handler: () => {
          this.deleteTask.emit(task);
          return true;
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ];
  });

  /**
   * Maneja el cierre del action sheet
   */
  protected onDismiss(): void {
    this.dismiss.emit();
  }
}