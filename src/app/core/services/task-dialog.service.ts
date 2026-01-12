import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

/**
 * Servicio especializado para manejar diálogos relacionados con tareas
 * Aplica el principio de responsabilidad única separando la UI del servicio principal
 */
@Injectable({
  providedIn: 'root'
})
export class TaskDialogService {

  constructor(private readonly alertController: AlertController) {}

  /**
   * Muestra un diálogo para crear una nueva tarea
   * @returns Promise que resuelve con los datos de la nueva tarea o null si se cancela
   */
  async showCreateTaskDialog(): Promise<CreateTaskDto | null> {
    const alert = await this.alertController.create({
      header: 'Nueva Tarea',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descripción de la tarea',
          attributes: {
            maxlength: 200,
            autocomplete: 'off'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Agregar',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            return this.validateTaskDescription(data.description);
          }
        }
      ],
      cssClass: 'task-alert'
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    
    if (result.role === 'cancel' || !result.data?.values?.description) {
      return null;
    }
    
    return {
      description: result.data.values.description.trim()
    };
  }

  /**
   * Muestra un diálogo para editar una tarea existente
   * @param task Tarea a editar
   * @returns Promise que resuelve con los datos actualizados o null si se cancela
   */
  async showEditTaskDialog(task: Task): Promise<UpdateTaskDto | null> {
    const alert = await this.alertController.create({
      header: 'Editar Tarea',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descripción de la tarea',
          value: task.description,
          attributes: {
            maxlength: 200,
            autocomplete: 'off'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Guardar',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            return this.validateTaskDescription(data.description);
          }
        }
      ],
      cssClass: 'task-alert'
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    
    if (result.role === 'cancel' || !result.data?.values?.description) {
      return null;
    }
    
    const newDescription = result.data.values.description.trim();
    
    // Solo devolver datos si realmente cambió algo
    if (newDescription === task.description) {
      return null;
    }
    
    return {
      description: newDescription
    };
  }

  /**
   * Muestra un diálogo de confirmación para eliminar una tarea
   * @param task Tarea a eliminar
   * @returns Promise que resuelve con true si se confirma la eliminación
   */
  async showDeleteTaskConfirmation(task: Task): Promise<boolean> {
    const alert = await this.alertController.create({
      header: 'Eliminar Tarea',
      message: '¿Estás seguro de que deseas eliminar esta tarea?',
      subHeader: `"${task.description}"`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-destructive'
        }
      ],
      cssClass: 'task-alert delete-alert'
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    
    return result.role === 'destructive';
  }

  /**
   * Valida que la descripción de la tarea no esté vacía
   * @param description Descripción a validar
   * @returns true si es válida, false si no
   */
  private validateTaskDescription(description: string | undefined): boolean {
    return Boolean(description && description.trim().length > 0);
  }
}