
export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: number[];
  MaxConcurrent: number;
}

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  message: string;
  field?: string;
  rowIndex?: number;
  suggestion?: string;
}

export interface Rule {
  id: string;
  type: 'co-run' | 'slot-restriction' | 'load-limit' | 'phase-window';
  description: string;
  config: any;
  enabled: boolean;
}

export interface DataStore {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  validationErrors: ValidationError[];
}
