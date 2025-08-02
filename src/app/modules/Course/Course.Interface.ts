export interface Icourse {
  title: string;
  description: string;
  location: string;
  duration: string;
  level: string;
  category: string;
  fee: number;
  enrolled: number;
  capacity: number;
  rating: number;
  totalReviews: number;
  language: string;
  certificate: boolean;
  lifetimeAccess: boolean;
  imageUrl: string;
  instructors: Array<{
    name: string;
    imageUrl: string;
    specialization: string;
    experience: string;
    rating: number;
    students: number;
  }>;
  tags: string[];
  whatYouWillLearn: string[];
  requirements: string[];
  startDate?: Date;
  endDate?: Date;
  status?: 'upcoming' | 'ongoing' | 'completed';
}