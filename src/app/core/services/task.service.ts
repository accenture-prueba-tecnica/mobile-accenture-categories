import { Injectable, signal, computed, inject } from '@angular/core';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStats } from '../models/task.model';

/**
 * Servicio para gestionar las tareas de la aplicación
 * Implementa el patrón Repository con Signals de Angular 20 y función inject
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly STORAGE_KEY = 'tasks';
  
  /** Signal privado con estado writable */
  private readonly tasksSignal = signal<Task[]>([]);
  
  /** Signal público de solo lectura */
  public readonly tasks = this.tasksSignal.asReadonly();
  
  /** Computed signal con el conteo de tareas */
  public readonly taskCount = computed(() => this.tasks().length);
  
  /** Computed signal con el conteo de tareas completadas */
  public readonly completedCount = computed(() => 
    this.tasks().filter(task => task.completed).length
  );
  
  /** Computed signal con el conteo de tareas pendientes */
  public readonly pendingCount = computed(() => 
    this.tasks().filter(task => !task.completed).length
  );

  /** Computed signal con las estadísticas de tareas */
  public readonly taskStats = computed<TaskStats>(() => ({
    total: this.taskCount(),
    completed: this.completedCount(),
    pending: this.pendingCount()
  }));

  constructor() {
    this.loadTasks();
  }

  /**
   * Obtiene todas las tareas (para compatibilidad)
   */
  getTasks(): Task[] {
    return this.tasks();
  }

  /**
   * Crea una nueva tarea
   * @param createTaskDto Datos para crear la tarea
   * @returns La tarea creada
   */
  createTask(createTaskDto: CreateTaskDto): Task {
    const newTask: Task = {
      id: this.generateId(),
      description: createTaskDto.description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentTasks = this.tasks();
    this.updateTasks([...currentTasks, newTask]);
    
    return newTask;
  }

  /**
   * Actualiza una tarea existente
   * @param id ID de la tarea a actualizar
   * @param updateTaskDto Datos a actualizar
   * @returns La tarea actualizada o null si no existe
   */
  updateTask(id: string, updateTaskDto: UpdateTaskDto): Task | null {
    const currentTasks = this.tasks();
    const taskIndex = currentTasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    const updatedTask: Task = {
      ...currentTasks[taskIndex],
      ...updateTaskDto,
      updatedAt: new Date()
    };

    const updatedTasks = [
      ...currentTasks.slice(0, taskIndex),
      updatedTask,
      ...currentTasks.slice(taskIndex + 1)
    ];

    this.updateTasks(updatedTasks);
    
    return updatedTask;
  }

  /**
   * Alterna el estado de completado de una tarea
   * @param id ID de la tarea
   * @returns La tarea actualizada o null si no existe
   */
  toggleTaskCompletion(id: string): Task | null {
    const task = this.tasks().find(t => t.id === id);
    
    if (!task) {
      return null;
    }

    return this.updateTask(id, { completed: !task.completed });
  }

  /**
   * Elimina una tarea
   * @param id ID de la tarea a eliminar
   * @returns true si se eliminó correctamente, false si no existe
   */
  deleteTask(id: string): boolean {
    const currentTasks = this.tasks();
    const filteredTasks = currentTasks.filter(t => t.id !== id);
    
    if (filteredTasks.length === currentTasks.length) {
      return false;
    }

    this.updateTasks(filteredTasks);
    
    return true;
  }

  /**
   * Elimina todas las tareas
   */
  clearAllTasks(): void {
    this.updateTasks([]);
  }

  /**
   * Carga las tareas desde el almacenamiento local
   */
  private loadTasks(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const tasks: Task[] = JSON.parse(stored);
        
        // Convertir las fechas de string a Date
        const parsedTasks = tasks.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        
        this.tasksSignal.set(parsedTasks);
      }
    } catch (error) {
      console.error('Error al cargar las tareas:', error);
      this.tasksSignal.set([]);
    }
  }

  /**
   * Actualiza la lista de tareas y persiste en el almacenamiento local
   */
  private updateTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      this.tasksSignal.set(tasks);
    } catch (error) {
      console.error('Error al guardar las tareas:', error);
    }
  }

  /**
   * Genera un ID único para las tareas
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
