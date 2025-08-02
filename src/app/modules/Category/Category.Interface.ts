export interface ICategory {
  name: string;
  description?: string;
  courseCount?: number;
  totalEnrollments?: number;
  status?: 'active' | 'inactive';
} 