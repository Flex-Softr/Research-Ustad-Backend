export interface Icourse {
  title: string;
  description: string;
  location: string;
  offlineLocation?: string; // New field for exact offline location
  duration: string;
  level: string;
  category: string;
  fee?: number; // Made optional for free courses
  isFree: boolean; // New field to indicate if course is free
  enrolled: number;
  capacity: number;
  rating: number;
  totalReviews: number;
  language: string;
  certificate: boolean;
  lifetimeAccess: boolean;
  enrollLink: string; // New field for enrollment link
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
  status?: 'upcoming' | 'ongoing';
}