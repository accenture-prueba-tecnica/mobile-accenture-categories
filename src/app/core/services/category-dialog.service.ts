import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import { CreateCategoryDto, UpdateCategoryDto, CATEGORY_ICONS, CATEGORY_COLOR_PRESETS } from '../models/category.model';

/**
 * Servicio para mostrar diálogos relacionados con categorías
 * Encapsula la lógica de interacción con el usuario usando AlertController
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryDialogService {
  private readonly alertController = inject(AlertController);

  /**
   * Muestra un diálogo para crear una nueva categoría
   * @returns Los datos de la categoría o null si se canceló
   */
  async showCreateCategoryDialog(): Promise<CreateCategoryDto | null> {
    const alert = await this.alertController.create({
      header: 'Nueva Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría',
          attributes: {
            maxlength: 50
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          role: 'confirm'
        }
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();

    if (result.role === 'confirm' && result.data?.values?.name?.trim()) {
      // Usar un preset aleatorio de colores
      const randomPreset = CATEGORY_COLOR_PRESETS[
        Math.floor(Math.random() * CATEGORY_COLOR_PRESETS.length)
      ];
      
      // Usar un ícono aleatorio
      const randomIcon = CATEGORY_ICONS[
        Math.floor(Math.random() * CATEGORY_ICONS.length)
      ];

      return {
        name: result.data.values.name.trim(),
        color: randomPreset.color,
        backgroundColor: randomPreset.backgroundColor,
        icon: randomIcon
      };
    }

    return null;
  }

  /**
   * Muestra un diálogo para editar una categoría existente
   * @param currentName Nombre actual de la categoría
   * @returns Los datos actualizados o null si se canceló
   */
  async showEditCategoryDialog(currentName: string): Promise<Partial<UpdateCategoryDto> | null> {
    const alert = await this.alertController.create({
      header: 'Editar Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría',
          value: currentName,
          attributes: {
            maxlength: 50
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          role: 'confirm'
        }
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();

    if (result.role === 'confirm' && result.data?.values?.name?.trim()) {
      return {
        name: result.data.values.name.trim()
      };
    }

    return null;
  }

  /**
   * Muestra un diálogo de confirmación para eliminar una categoría
   * @param categoryName Nombre de la categoría a eliminar
   * @returns true si se confirmó la eliminación, false en caso contrario
   */
  async showDeleteCategoryConfirmation(categoryName: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header: 'Eliminar Categoría',
      message: `¿Estás seguro de que deseas eliminar la categoría "${categoryName}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive'
        }
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();

    return result.role === 'destructive';
  }

  /**
   * Muestra un mensaje de error
   * @param message Mensaje de error a mostrar
   */
  async showErrorAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
