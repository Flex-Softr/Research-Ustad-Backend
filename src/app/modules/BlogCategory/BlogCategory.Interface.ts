export interface IBlogCategory {
  name: string;
  description?: string;
  blogCount?: number;
  status?: 'active' | 'inactive';
}
