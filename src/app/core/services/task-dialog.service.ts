import { Injectable, inject } from '@angular/core';
import { AlertController, ActionSheetController } from '@ionic/angular/standalone';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { Category } from '../models/category.model';
import { CategoryService } from './category.service';

/**
 * Servicio especializado para manejar diálogos relacionados con tareas
 * Aplica el principio de responsabilidad única separando la UI del servicio principal
 */
@Injectable({
  providedIn: 'root'
})
export class TaskDialogService {
  private readonly alertController = inject(AlertController);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly categoryService = inject(CategoryService);

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
   * Muestra un action sheet para seleccionar una categoría
   * @param currentCategoryId ID de la categoría actual (opcional)
   * @returns Promise que resuelve con el ID de la categoría seleccionada o null si se cancela
   */
  async showCategorySelector(currentCategoryId?: string): Promise<string | null> {
    const categories = this.categoryService.getCategories();
    
    if (categories.length === 0) {
      await this.showErrorAlert('No hay categorías disponibles. Crea una categoría primero.');
      return null;
    }

    const buttons = categories.map(category => ({
      text: category.name,
      icon: this.getCategoryIcon(category.icon),
      cssClass: currentCategoryId === category.id ? 'action-sheet-selected' : '',
      data: category.id,
      handler: () => {
        return true;
      }
    }));

    buttons.push({
      text: 'Cancelar',
      role: 'cancel',
      icon: 'close',
      handler: () => {
        return true;
      }
    } as any);

    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar Categoría',
      buttons: buttons as any,
      cssClass: 'category-selector-action-sheet'
    });

    await actionSheet.present();
    const result = await actionSheet.onDidDismiss();
    
    return result.data || null;
  }

  /**
   * Muestra un mensaje de error
   * @param message Mensaje de error a mostrar
   */
  async showErrorAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });

    await alert.present();
    await alert.onDidDismiss();
  }

  /**
   * Convierte el nombre del icono al formato de Ionicons
   * @param iconName Nombre del icono Material
   * @returns Nombre del icono en formato Ionicons
   */
  private getCategoryIcon(iconName: string): string {
    const iconMap: Record<string, string> = {
      'work': 'briefcase-outline',
      'home': 'home-outline',
      'lightbulb': 'bulb-outline',
      'person': 'person-outline',
      'fitness_center': 'barbell-outline',
      'flight': 'airplane-outline'
    };
    
    return iconMap[iconName] || 'folder-outline';
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