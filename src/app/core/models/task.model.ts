/**
 * Modelo de datos para una tarea
 */
export interface Task {
  /** Identificador único de la tarea */
  readonly id: string;
  
  /** Descripción o título de la tarea */
  readonly description: string;
  
  /** Estado de completado de la tarea */
  readonly completed: boolean;
  
  /** ID de la categoría asignada (opcional) */
  readonly categoryId?: string;
  
  /** Fecha de creación de la tarea */
  readonly createdAt: Date;
  
  /** Fecha de última actualización */
  readonly updatedAt: Date;
}

/**
 * DTO para crear una nueva tarea
 */
export interface CreateTaskDto {
  readonly description: string;
  readonly categoryId?: string;
}

/**
 * DTO para actualizar una tarea existente
 */
export interface UpdateTaskDto {
  readonly description?: string;
  readonly categoryId?: string;
  readonly completed?: boolean;
}

/**
 * Configuración de estado para el header de tareas
 */
export interface TaskHeaderConfig {
  readonly title: string;
  readonly showBackButton: boolean;
}

/**
 * Configuración para los botones del action sheet de opciones
 */
export interface TaskActionConfig {
  readonly text: string;
  readonly icon: string;
  readonly role?: 'destructive' | 'cancel';
  readonly handler?: () => void;
}

/**
 * Estado de las estadísticas de tareas para visualización
 */
export interface TaskStats {
  readonly total: number;
  readonly completed: number;
  readonly pending: number;
}
