import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent,
  AlertController,
  NavController
} from '@ionic/angular/standalone';

import { Task, TaskHeaderConfig } from '../core/models/task.model';
import { FirebaseTaskService } from '../core/services/firebase-task.service';
import { TaskDialogService } from '../core/services/task-dialog.service';

// Componentes granulares
import { TaskHeaderComponent } from '../shared/components/task-header/task-header.component';
import { TaskListComponent } from '../shared/components/task-list/task-list.component';
import { AddTaskButtonComponent } from '../shared/components/add-task-button/add-task-button.component';
import { TaskOptionsComponent } from '../shared/components/task-options/task-options.component';

/**
 * Página principal que actúa como contenedor inteligente (Smart Component)
 * Coordina la interacción entre componentes presentacionales granulares
 * Implementa las mejores prácticas de Angular 20 con función inject y signals
 */
@Component({
  selector: 'app-tareas',
  templateUrl: 'tareas.page.html',
  styleUrls: ['tareas.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    TaskHeaderComponent,
    TaskListComponent,
    AddTaskButtonComponent,
    TaskOptionsComponent
  ],
})
export class TareasPage {
  // Inyección usando la función inject (Angular 20 best practice)
  private readonly taskService = inject(FirebaseTaskService);
  private readonly taskDialogService = inject(TaskDialogService);
  private readonly router = inject(Router);
  private readonly navController = inject(NavController);

  /** Signal para la tarea seleccionada */
  protected readonly selectedTask = signal<Task | null>(null);
  
  /** Signal para el estado del action sheet */
  protected readonly isActionSheetOpen = signal(false);
  
  /** Configuración del header */
  protected readonly headerConfig: TaskHeaderConfig = {
    title: 'Trabajo',
    showBackButton: true
  };
  
  /** Acceso directo a las tareas del servicio (signal readonly) */
  protected readonly tasks = this.taskService.tasks;
  
  /** Computed signals del servicio para estadísticas */
  protected readonly taskStats = this.taskService.taskStats;

  /**
   * Maneja el click en el botón de retroceso del header
   */
  protected onHeaderBackClick(): void {
    this.navController.navigateBack('/categories');
  }

  /**
   * Alterna el estado de completado de una tarea
   */
  protected onTaskToggle(task: Task): void {
    this.taskService.toggleTaskCompletion(task.id);
  }

  /**
   * Abre el action sheet para una tarea
   */
  protected onTaskOptions(data: { task: Task; event: Event }): void {
    data.event.stopPropagation();
    this.selectedTask.set(data.task);
    this.isActionSheetOpen.set(true);
  }

  /**
   * Cierra el action sheet
   */
  protected onActionSheetDismiss(): void {
    this.isActionSheetOpen.set(false);
    setTimeout(() => {
      this.selectedTask.set(null);
    }, 300);
  }

  /**
   * Inicia el proceso de agregar una nueva tarea
   */
  protected async onAddNewTask(): Promise<void> {
    const taskData = await this.taskDialogService.showCreateTaskDialog();
    
    if (taskData) {
      this.taskService.createTask(taskData);
    }
  }

  /**
   * Inicia el proceso de edición de una tarea
   */
  protected async onEditTask(task: Task): Promise<void> {
    this.onActionSheetDismiss();
    
    const updateData = await this.taskDialogService.showEditTaskDialog(task);
    
    if (updateData) {
      this.taskService.updateTask(task.id, updateData);
    }
  }

  /**
   * Confirma y elimina una tarea
   */
  protected async onDeleteTask(task: Task): Promise<void> {
    this.onActionSheetDismiss();
    
    const confirmed = await this.taskDialogService.showDeleteTaskConfirmation(task);
    
    if (confirmed) {
      this.taskService.deleteTask(task.id);
    }
  }
}
