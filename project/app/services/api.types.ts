// app/services/api.types.ts

// --- Authentication ---
export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string; // Renamed from 'token' to match backend JSON key
  token_type?: string; // Optional: If backend sends 'token_type', usually "Bearer"
  user_id: number;    // Renamed from 'userId' to match backend JSON key
  username: string;
  email: string;
  role: Role;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role?: Role; // Role might be optional during registration
}

// --- Core Entities ---
export interface User {
  id: number; // Internal representation in frontend state/storage still uses 'id'
  username: string;
  email: string;
  role: Role;
}

export type Role = 'ROLE_LEARNER' | 'ROLE_INSTRUCTOR' | 'ROLE_ADMIN' | 'ROLE_COMPANY_REP';

export interface Company {
  companyId: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  representative?: User; // Use the User type
  createdAt?: string;
}

export interface Service {
  serviceId: number;
  name: string;
  description: string;
  category: string;
  priceRange: string;
  company: Company; // Use the Company type
  createdAt?: string;
}

export type CourseMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  courseId: number;
  title: string;
  description: string;
  mode: CourseMode;
  status?: CourseStatus; // Make optional if not always present
  category: string;
  price: number;
  duration?: number; // Optional based on previous DDL
  instructorId?: number;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  createdAt?: string; // Optional
  updatedAt?: string; // Optional
  certificationEligible?: boolean; // Added based on DDL
}

export interface Event {
  id?: number; // Use 'id' consistent with frontend if possible, map from 'event_id' if needed
  eventId?: number; // Keep if backend uses event_id
  title: string;
  description: string;
  eventDate: string; // ISO String
  location?: string;
  registrationDeadline?: string;
  currentParticipants?: number;
  maxParticipants?: number;
  price?: number; // Added based on DDL
  company?: Company; // Use Company type
  createdAt?: string;
}

export interface Instructor {
  instructorId: number;
  user: User; // Use the User type
  bio: string;
  expertise: string;
  rating?: number; // Optional
  // courses?: Course[]; // Avoid deep nesting if not needed directly
  // reviews?: Review[]; // Avoid deep nesting if not needed directly
  createdAt?: string;
}


// --- Actions & Sub-Entities ---

export type CertificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface Certification {
  id?: number; // Use 'id' for consistency
  certificationId?: number; // Keep if backend uses certification_id
  userId: number;
  courseId: number;
  certificateCode?: string; // Added based on DDL
  certificationDate?: string; // Keep original names if needed
  issueDate?: string; // Added based on DDL
  expirationDate?: string; // Keep original names if needed
  expiryDate?: string; // Added based on DDL
  status: CertificationStatus;
}


export type EnrollmentStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Enrollment {
  id?: number; // Use 'id' for consistency
  enrollmentId?: number; // Keep if backend uses enrollment_id
  userId: number;
  courseId: number;
  enrollmentDate: string;
  completionDate?: string; // Added based on DDL
  status: EnrollmentStatus;
  paymentId?: number; // Added based on DDL
}


export interface Review {
  id?: number; // Use 'id' for consistency
  reviewId?: number; // Keep if backend uses review_id
  userId: number;
  courseId?: number;
  instructorId?: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL'; // Match backend enum/string if possible

export interface Payment {
  id?: number; // Use 'id' for consistency
  paymentId?: number; // Keep if backend uses payment_id
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod | string; // Allow string if backend sends it differently
  transactionId?: string; // Use if backend sends it
  transactionReference?: string; // Use based on DDL
  clictopayToken?: string; // Added based on DDL
  currency?: string; // Added based on DDL
  userId: number;
  courseId?: number;
  eventId?: number;
  createdAt: string;
  updatedAt?: string; // Added based on DDL
  paymentDate?: string; // Added based on DDL
  description?: string; // Added based on previous UI examples
}


export type EventRegistrationStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface EventRegistration {
  id?: number; // Use 'id' for consistency
  registrationId?: number; // Keep if backend uses registration_id
  userId: number;
  eventId: number;
  status: EventRegistrationStatus;
  registrationDate: string;
  attended?: boolean; // Optional
  createdAt?: string; // Added based on DDL
}

// --- User Profile & Updates ---
export interface UserProfile extends User { // Extend User type
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add other profile fields if needed
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string; // For password change validation
  newPassword?: string;    // For password change
}

// --- Utility Types ---
export interface AvailabilityResponse {
  available: boolean;
}

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

export interface ApiError {
  message: string;
  status?: number;
  timestamp?: string;
  details?: any;
}

// --- Health Check Types ---
export interface AuthHealthResponse {
  status: string;
  application: string;
  activeProfiles: string;
  timestamp: number;
  database: string;
}