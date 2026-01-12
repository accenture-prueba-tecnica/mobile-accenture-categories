import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Category, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryStats,
  CategoryWithCount 
} from '../models/category.model';

/**
 * Servicio para gestionar categorías usando Firestore
 * Integración con Firebase Firestore para sincronización en tiempo real
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseCategoryService {
  private firestore = inject(Firestore);
  private categoriesCollection = collection(this.firestore, 'categories');
  
  /** Signal privado con estado writable */
  private readonly categoriesSignal = signal<Category[]>([]);
  
  /** Signal público de solo lectura */
  public readonly categories = this.categoriesSignal.asReadonly();
  
  /** Computed signal con el conteo de categorías */
  public readonly categoryCount = computed(() => this.categories().length);
  
  /** Computed signal con las estadísticas de categorías */
  public readonly categoryStats = computed<CategoryStats>(() => ({
    total: this.categoryCount(),
    withTasks: 0, // Se calculará cuando se integre con TaskService
    empty: this.categoryCount()
  }));

  constructor() {
    this.loadCategories();
  }

  /**
   * Carga las categorías desde Firestore con sincronización en tiempo real
   */
  private loadCategories(): void {
    this.getCategories$().subscribe({
      next: (categories) => {
        this.categoriesSignal.set(categories);
      },
      error: (error) => {
        console.error('Error al cargar categorías desde Firestore:', error);
        this.categoriesSignal.set([]);
      }
    });
  }

  /**
   * Observable que escucha cambios en tiempo real de las categorías
   */
  getCategories$(): Observable<Category[]> {
    return collectionData(this.categoriesCollection, { idField: 'id' }).pipe(
      map((docs: any[]) => {
        return docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          color: doc.color,
          backgroundColor: doc.backgroundColor,
          icon: doc.icon,
          createdAt: doc.createdAt?.toDate() || new Date(),
          updatedAt: doc.updatedAt?.toDate() || new Date()
        }));
      })
    );
  }

  /**
   * Obtiene todas las categorías (snapshot actual)
   */
  getCategories(): Category[] {
    return this.categories();
  }

  /**
   * Obtiene una categoría por su ID
   * @param id ID de la categoría
   * @returns La categoría o undefined si no existe
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories().find(c => c.id === id);
  }

  /**
   * Crea una nueva categoría en Firestore
   * @param createCategoryDto Datos para crear la categoría
   * @returns Promise con la categoría creada
   */
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const categoryData = {
        name: createCategoryDto.name,
        color: createCategoryDto.color,
        backgroundColor: createCategoryDto.backgroundColor,
        icon: createCategoryDto.icon,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(this.categoriesCollection, categoryData);

      const newCategory: Category = {
        id: docRef.id,
        name: createCategoryDto.name,
        color: createCategoryDto.color,
        backgroundColor: createCategoryDto.backgroundColor,
        icon: createCategoryDto.icon,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return newCategory;
    } catch (error) {
      console.error('Error al crear categoría en Firestore:', error);
      throw error;
    }
  }

  /**
   * Actualiza una categoría existente en Firestore
   * @param id ID de la categoría a actualizar
   * @param updateCategoryDto Datos a actualizar
   * @returns Promise con la categoría actualizada o null si no existe
   */
  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    try {
      const category = this.getCategoryById(id);
      
      if (!category) {
        return null;
      }

      const categoryRef = doc(this.firestore, 'categories', id);
      
      const updateData: any = {
        ...updateCategoryDto,
        updatedAt: serverTimestamp()
      };

      await updateDoc(categoryRef, updateData);

      const updatedCategory: Category = {
        ...category,
        ...updateCategoryDto,
        updatedAt: new Date()
      };

      return updatedCategory;
    } catch (error) {
      console.error('Error al actualizar categoría en Firestore:', error);
      throw error;
    }
  }

  /**
   * Elimina una categoría de Firestore
   * @param id ID de la categoría a eliminar
   * @returns Promise con true si se eliminó correctamente, false si no existe
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const category = this.getCategoryById(id);
      
      if (!category) {
        return false;
      }

      const categoryRef = doc(this.firestore, 'categories', id);
      await deleteDoc(categoryRef);

      return true;
    } catch (error) {
      console.error('Error al eliminar categoría en Firestore:', error);
      throw error;
    }
  }

  /**
   * Obtiene categorías con contador de tareas
   * @param taskCounts Mapa de ID de categoría a número de tareas
   * @returns Array de categorías con contador
   */
  getCategoriesWithCount(taskCounts: Map<string, number>): CategoryWithCount[] {
    return this.categories().map(category => ({
      ...category,
      taskCount: taskCounts.get(category.id) || 0
    }));
  }
}
