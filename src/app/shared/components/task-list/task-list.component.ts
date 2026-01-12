import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';

/**
 * Componente presentacional para mostrar una lista de tareas
 * Implementa el patrón Smart/Dumb Component con signals
 */
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TaskItemComponent
  ]
})
export class TaskListComponent {
  /** Lista de tareas a mostrar */
  readonly tasks = input.required<Task[]>();
  
  /** Tarea actualmente seleccionada */
  readonly selectedTask = input<Task | null>(null);
  
  /** Evento cuando se hace toggle en una tarea */
  readonly taskToggle = output<Task>();
  
  /** Evento cuando se abren las opciones de una tarea */
  readonly taskOptions = output<{ task: Task; event: Event }>();

  /** Computed signal para determinar si hay tareas */
  protected readonly hasTasks = computed(() => this.tasks().length > 0);

  /**
   * Maneja el toggle de una tarea
   */
  protected onTaskToggle(task: Task): void {
    this.taskToggle.emit(task);
  }

  /**
   * Maneja la apertura de opciones para una tarea
   */
  protected onTaskOptions(data: { task: Task; event: Event }): void {
    this.taskOptions.emit(data);
  }

  /**
   * Función de tracking para el @for (mejora el rendimiento)
   */
  protected trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}