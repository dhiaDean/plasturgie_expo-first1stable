// This file contains only TypeScript interfaces and types.
// It is platform-agnostic and does not require changes for React Native.
// Keep the content exactly as you provided.

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user_id: number;
  username: string;
  email: string;
  role: Role;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export type Role = 'ROLE_LEARNER' | 'ROLE_INSTRUCTOR' | 'ROLE_ADMIN' | 'ROLE_COMPANY_REP';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

export interface AuthHealthResponse {
  status: string;
  application: string;
  activeProfiles: string;
  timestamp: number;
  database: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role?: Role;
}

export interface Service {
  serviceId: number;
  name: string;
  description: string;
  category: string;
  priceRange: string;
  company: Company;
  createdAt?: string;
}

export interface Company {
  companyId: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  representative?: User;
  createdAt?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UserAvailabilityResponse {
  available: boolean;
}

export interface Certification {
  id: number;
  userId: number;
  courseId: number;
  certificationDate: string;
  expirationDate: string;
  status: CertificationStatus;
}

export type CertificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

// Define Event based on your specific API response for events if different from Course/Service
export interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string; // ISO String
  location?: string; // Added location based on previous examples
  // Add other relevant event fields from your API
  // registrationDeadline: string;
  // currentParticipants: number;
  // maxParticipants: number;
  // company: Company;
}

export interface Course {
  courseId: number;
  title: string;
  description: string;
  mode: CourseMode;
  status: CourseStatus;
  category: string;
  price: number;
  duration: number; // Assuming duration is in minutes or hours
  instructorId?: number; // Make optional if not always present
  startDate?: string; // Optional
  endDate?: string; // Optional
  maxParticipants?: number; // Optional
  currentParticipants?: number; // Optional
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrollmentDate: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Review {
  id: number;
  userId: number;
  courseId?: number;
  instructorId?: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  userId: number;
  courseId?: number;
  eventId?: number;
  createdAt: string;
  updatedAt: string;
  // Added description based on UI needs from previous examples
  description?: string;
}

export interface EventRegistration {
  id: number;
  userId: number;
  eventId: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  registrationDate: string;
  attended: boolean;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AvailabilityResponse {
  available: boolean;
}

export type CourseMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';


export interface CourseCreate {
  title: string;
  description: string;
  category: string;
  mode: CourseMode;
  price: number;
  maxStudents: number;
  certificationEligible: boolean;
}

export interface Instructor {
  instructorId: number;
  user: User;
  bio: string;
  expertise: string;
  rating: number;
  courses: Course[];
  reviews: Review[];
  createdAt: string;
}

export interface InstructorCreate {
  bio: string;
  expertise: string;
  userId: number;
}

export interface ReviewCreate {
  rating: number;
  comment: string;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL';

export interface PaymentCreate {
  amount: number;
  paymentMethod: PaymentMethod;
  courseId?: number;
  eventId?: number;
}

export interface ApiError {
  message: string;
  status?: number; // Make status optional as it might not always be present
  timestamp?: string; // Make timestamp optional
  details?: any; // Add optional field for more detailed errors if API provides them
}
