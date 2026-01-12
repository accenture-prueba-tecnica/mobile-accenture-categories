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
import { Task, CreateTaskDto, UpdateTaskDto, TaskStats } from '../models/task.model';

/**
 * Servicio para gestionar tareas usando Firestore
 * Integración con Firebase Firestore para sincronización en tiempo real
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseTaskService {
  private firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');
  
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
   * Carga las tareas desde Firestore con sincronización en tiempo real
   */
  private loadTasks(): void {
    this.getTasks$().subscribe({
      next: (tasks) => {
        this.tasksSignal.set(tasks);
      },
      error: (error) => {
        console.error('Error al cargar tareas desde Firestore:', error);
        this.tasksSignal.set([]);
      }
    });
  }

  /**
   * Observable que escucha cambios en tiempo real de las tareas
   */
  getTasks$(): Observable<Task[]> {
    return collectionData(this.tasksCollection, { idField: 'id' }).pipe(
      map((docs: any[]) => {
        return docs.map(doc => ({
          id: doc.id,
          description: doc.description,
          completed: doc.completed,
          categoryId: doc.categoryId,
          createdAt: doc.createdAt?.toDate() || new Date(),
          updatedAt: doc.updatedAt?.toDate() || new Date()
        }));
      })
    );
  }

  /**
   * Obtiene todas las tareas (snapshot actual)
   */
  getTasks(): Task[] {
    return this.tasks();
  }

  /**
   * Crea una nueva tarea en Firestore
   * @param createTaskDto Datos para crear la tarea
   * @returns Promise con la tarea creada
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const taskData = {
        description: createTaskDto.description,
        completed: false,
        categoryId: createTaskDto.categoryId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(this.tasksCollection, taskData);
      
      const newTask: Task = {
        id: docRef.id,
        description: createTaskDto.description,
        completed: false,
        categoryId: createTaskDto.categoryId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return newTask;
    } catch (error) {
      console.error('Error al crear tarea en Firestore:', error);
      throw error;
    }
  }

  /**
   * Actualiza una tarea existente en Firestore
   * @param id ID de la tarea a actualizar
   * @param updateTaskDto Datos a actualizar
   * @returns Promise con la tarea actualizada o null si no existe
   */
  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    try {
      const taskRef = doc(this.firestore, 'tasks', id);
      
      const updateData: any = {
        ...updateTaskDto,
        updatedAt: serverTimestamp()
      };

      await updateDoc(taskRef, updateData);

      // Buscar la tarea actualizada en el signal
      const currentTasks = this.tasks();
      const updatedTask = currentTasks.find(t => t.id === id);
      
      if (updatedTask) {
        return {
          ...updatedTask,
          ...updateTaskDto,
          updatedAt: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Error al actualizar tarea en Firestore:', error);
      throw error;
    }
  }

  /**
   * Alterna el estado de completado de una tarea
   * @param id ID de la tarea
   * @returns Promise con la tarea actualizada o null si no existe
   */
  async toggleTask(id: string): Promise<Task | null> {
    const currentTasks = this.tasks();
    const task = currentTasks.find(t => t.id === id);
    
    if (!task) {
      return null;
    }

    return this.updateTask(id, { completed: !task.completed });
  }

  /**
   * Alterna el estado de completado de una tarea (alias de toggleTask)
   * @param id ID de la tarea
   * @returns Promise con la tarea actualizada o null si no existe
   */
  async toggleTaskCompletion(id: string): Promise<Task | null> {
    return this.toggleTask(id);
  }

  /**
   * Elimina una tarea de Firestore
   * @param id ID de la tarea a eliminar
   * @returns Promise<void>
   */
  async deleteTask(id: string): Promise<void> {
    try {
      const taskRef = doc(this.firestore, 'tasks', id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error al eliminar tarea de Firestore:', error);
      throw error;
    }
  }

  /**
   * Filtra tareas por categoría
   * @param categoryId ID de la categoría (null para tareas sin categoría)
   * @returns Array de tareas filtradas
   */
  getTasksByCategory(categoryId: string | null): Task[] {
    return this.tasks().filter(task => task.categoryId === categoryId);
  }

  /**
   * Obtiene tareas completadas
   */
  getCompletedTasks(): Task[] {
    return this.tasks().filter(task => task.completed);
  }

  /**
   * Obtiene tareas pendientes
   */
  getPendingTasks(): Task[] {
    return this.tasks().filter(task => !task.completed);
  }
}
