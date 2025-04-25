import Constants from 'expo-constants';

// Using Option 1 (app.json/app.config.js) is preferred, but fallback is included
// Ensure you have set "apiBaseUrl" in your app.json/app.config.js extra field
// e.g., "extra": { "apiBaseUrl": "http://192.168.1.100:5000/api" }
const API_BASE_URL_FROM_CONFIG = Constants.expoConfig?.extra?.apiBaseUrl;

// Fallback if not defined in config (REPLACE with your actual local IP for testing)
const FALLBACK_API_URL = 'http://192.168.1.14:5000/api'; // <-- !! REPLACE with your correct local IP:PORT/api base !!

// Use the config URL if available, otherwise fall back
export const API_BASE_URL = API_BASE_URL_FROM_CONFIG || FALLBACK_API_URL;

// Log the final URL being used for debugging purposes
console.log("---------- Using API Base URL:", API_BASE_URL, "----------");
if (!API_BASE_URL_FROM_CONFIG) {
    console.warn("API_BASE_URL not found in Expo config (app.json > expo > extra > apiBaseUrl), using fallback:", FALLBACK_API_URL);
}


// Basic configuration often set directly in the service, but can be defined here
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
};

// Centralized API Endpoints
export const API_ENDPOINTS = {
  // --- Authentication ---
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    CURRENT_USER: `${API_BASE_URL}/auth/me`, // Endpoint to get logged-in user info
    LOGOUT: `${API_BASE_URL}/auth/logout`
  },
  // --- Companies ---
  COMPANIES: {
    BASE: `${API_BASE_URL}/companies`,
    SEARCH: `${API_BASE_URL}/companies/search`,
    BY_CITY: `${API_BASE_URL}/companies/by-city`
  },
  // --- Services ---
  SERVICES: {
    BASE: `${API_BASE_URL}/services`
  },
  // --- Courses ---
  COURSES: {
    BASE: `${API_BASE_URL}/courses`,
    // Function to generate URL for a specific course by ID
    BY_ID: (courseId: number | string) => `${API_BASE_URL}/courses/${courseId}`
  },
  // --- Events ---
  EVENTS: {
    BASE: `${API_BASE_URL}/events`
    // Add BY_ID or other specific event endpoints if needed:
    // BY_ID: (eventId: number | string) => `${API_BASE_URL}/events/${eventId}`
  },
  // --- Enrollments ---
  ENROLLMENTS: {
    // Endpoint to get enrollments for the current logged-in user
    ME: `${API_BASE_URL}/enrollments/user`
    // Add other enrollment endpoints if needed (e.g., create, get by ID)
    // CREATE: `${API_BASE_URL}/enrollments`,
    // BY_ID: (enrollmentId: number | string) => `${API_BASE_URL}/enrollments/${enrollmentId}`
  },
  // --- Certifications ---
  CERTIFICATIONS: {
    // Endpoint to get certifications for the current logged-in user
    ME: `${API_BASE_URL}/certifications/my-certifications`
    // Add other certification endpoints if needed
    // BY_ID: (certificationId: number | string) => `${API_BASE_URL}/certifications/${certificationId}`
  },
  // --- Payments ---
  PAYMENTS: {
      // Example: Endpoint to get payments for the current logged-in user
      ME: `${API_BASE_URL}/payments/me`
  },
  // --- Reviews ---
  REVIEWS: {
      // Example: Endpoint to get reviews for the current logged-in user
      ME: `${API_BASE_URL}/reviews/me`,
      // Example: Endpoint to create a review for a course
      CREATE_COURSE_REVIEW: (courseId: number | string) => `${API_BASE_URL}/courses/${courseId}/reviews`
  }
  // Add other top-level categories as needed
};
