import { Injectable, signal, computed } from '@angular/core';
import { 
  Category, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryStats,
  CategoryWithCount,
  CATEGORY_COLOR_PRESETS 
} from '../models/category.model';

/**
 * Servicio para gestionar las categorías de la aplicación
 * Implementa el patrón Repository con Signals de Angular 20
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly STORAGE_KEY = 'categories';
  
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
   * Obtiene todas las categorías (para compatibilidad)
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
   * Crea una nueva categoría
   * @param createCategoryDto Datos para crear la categoría
   * @returns La categoría creada
   */
  createCategory(createCategoryDto: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: this.generateId(),
      name: createCategoryDto.name,
      color: createCategoryDto.color,
      backgroundColor: createCategoryDto.backgroundColor,
      icon: createCategoryDto.icon,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentCategories = this.categories();
    this.updateCategories([...currentCategories, newCategory]);
    
    return newCategory;
  }

  /**
   * Actualiza una categoría existente
   * @param id ID de la categoría a actualizar
   * @param updateCategoryDto Datos a actualizar
   * @returns La categoría actualizada o null si no existe
   */
  updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Category | null {
    const currentCategories = this.categories();
    const categoryIndex = currentCategories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
      return null;
    }

    const updatedCategory: Category = {
      ...currentCategories[categoryIndex],
      ...updateCategoryDto,
      updatedAt: new Date()
    };

    const updatedCategories = [
      ...currentCategories.slice(0, categoryIndex),
      updatedCategory,
      ...currentCategories.slice(categoryIndex + 1)
    ];

    this.updateCategories(updatedCategories);
    
    return updatedCategory;
  }

  /**
   * Elimina una categoría
   * @param id ID de la categoría a eliminar
   * @returns true si se eliminó correctamente, false si no existe
   */
  deleteCategory(id: string): boolean {
    const currentCategories = this.categories();
    const filteredCategories = currentCategories.filter(c => c.id !== id);
    
    if (filteredCategories.length === currentCategories.length) {
      return false;
    }

    this.updateCategories(filteredCategories);
    
    return true;
  }

  /**
   * Elimina todas las categorías
   */
  clearAllCategories(): void {
    this.updateCategories([]);
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

  /**
   * Carga las categorías desde el almacenamiento local
   */
  private loadCategories(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const categories: Category[] = JSON.parse(stored);
        
        // Convertir las fechas de string a Date
        const parsedCategories = categories.map(category => ({
          ...category,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt)
        }));
        
        this.categoriesSignal.set(parsedCategories);
      }
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
      this.categoriesSignal.set([]);
    }
  }

  /**
   * Actualiza la lista de categorías y persiste en el almacenamiento local
   */
  private updateCategories(categories: Category[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
      this.categoriesSignal.set(categories);
    } catch (error) {
      console.error('Error al guardar las categorías:', error);
    }
  }

  /**
   * Genera un ID único para las categorías
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
