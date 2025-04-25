import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure AsyncStorage is imported if needed directly (though token is usually handled by context)
import { API_BASE_URL, API_ENDPOINTS } from './api.constants';
// Adjust path if your types file is elsewhere
import type {
    AuthRequest, AuthResponse, User, RegisterRequest, Company, Course, Service, Event, Enrollment, Certification, Payment, Review, ApiError
} from './api.types';

const TOKEN_STORAGE_KEY = 'auth_token_key'; // Consistent key with AuthContext

class ApiService {
  private token: string | null = null;

  // Method to load token initially (called by AuthContext)
  async loadTokenFromStorage() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        this.token = storedToken;
        console.log('ApiService: Token loaded from storage:', !!storedToken);
      } catch (e) {
          console.error("ApiService: Failed to load token from storage", e);
          this.token = null;
      }
  }

  setToken(token: string | null) {
    this.token = token;
    // Persisting token is handled by AuthContext, service just holds it in memory
    console.log('ApiService: Token set in memory:', !!token);
  }

  clearToken() {
    this.token = null;
    console.log('ApiService: Token cleared from memory');
  }

  getToken(): string | null {
      return this.token;
  }

  // Core request method
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Use the token held in memory by this service instance
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
        // Optionally check storage again as a fallback? Depends on architecture.
        // const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        // if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
    }

    console.log(`ApiService Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
        // console.log('ApiService Request Body:', options.body); // Be careful logging sensitive data
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers, // Allow overriding headers per-request
            },
        });

        // Handle responses with no content (e.g., 204 No Content)
        if (response.status === 204) {
             console.log(`ApiService Response: ${response.status} No Content`);
             return null as T; // Return null, caller must handle this possibility
        }

        // Try to parse JSON regardless of status code first, as errors might have bodies
        let responseData: any;
        try {
             responseData = await response.json();
        } catch (e) {
             // If JSON parsing fails AND status is not ok, throw based on status text
             if (!response.ok) {
                 throw {
                     response: { status: response.status },
                     message: response.statusText || `HTTP error ${response.status}`
                 };
             }
             // If JSON parsing fails but status IS ok (e.g., unexpected empty body), return null or throw
             console.warn(`ApiService Warning: Could not parse JSON for OK response (${response.status}) from ${url}`);
             return null as T; // Or throw new Error('Received OK status but invalid JSON body');
        }


        // Check if response status code is ok (200-299) AFTER parsing
        if (!response.ok) {
            const errorPayload: ApiError = {
                message: responseData?.message || responseData?.error || `HTTP error! status: ${response.status}`,
                status: response.status,
                details: responseData?.details || responseData,
            };
            console.error('ApiService Error Response:', errorPayload);
            throw { response: { data: errorPayload, status: response.status }, message: errorPayload.message };
        }

        // console.log('ApiService Response Data:', responseData); // Optional: log success data
        return responseData as T;

    } catch (error: any) {
        console.error('ApiService Fetch/Network Error:', error);
        // Ensure a consistent error format is thrown
        if (error.response?.data) {
            throw error; // Already in our custom format
        } else if (error instanceof Error) {
             // Wrap generic Error
             throw { response: { data: { message: error.message } }, message: error.message };
        } else {
             // Wrap unknown error
             throw { response: { data: { message: 'An unknown network error occurred' } }, message: 'An unknown network error occurred' };
        }
    }
  }

  // --- Auth ---
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<void> {
    // Assuming register returns 204 No Content or similar on success
    await this.request<void>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    // Should throw 401 if token is invalid/expired, handled by request method
    return this.request<User>(API_ENDPOINTS.AUTH.CURRENT_USER, { method: 'GET' }); // Explicit GET
  }

  async logout(): Promise<void> {
    // Attempt server logout but don't fail hard if it doesn't work
    try {
        await this.request<void>(API_ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST'
        });
    } catch (error: any) {
        // Log the error but don't re-throw, proceed with client-side logout
        console.warn("Server logout API call failed (status: " + error?.response?.status + "):", error.message);
    } finally {
        this.clearToken(); // Ensure token is cleared from service memory
    }
  }

  // --- Company ---
  async getCompanies(): Promise<Company[]> {
    return this.request<Company[]>(API_ENDPOINTS.COMPANIES.BASE);
  }

  async searchCompanies(query: string): Promise<Company[]> {
    return this.request<Company[]>(`${API_ENDPOINTS.COMPANIES.SEARCH}?query=${encodeURIComponent(query)}`);
  }

  async getCompaniesByCity(city: string): Promise<Company[]> {
    return this.request<Company[]>(`${API_ENDPOINTS.COMPANIES.BY_CITY}?city=${encodeURIComponent(city)}`);
  }

  // --- Roles (Client-side list) ---
  async getRoles(): Promise<string[]> {
    // This doesn't need to be async if it's just a static list
    return ["ROLE_LEARNER", "ROLE_INSTRUCTOR", "ROLE_ADMIN", "ROLE_COMPANY_REP"];
  }

  // --- Services ---
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>(API_ENDPOINTS.SERVICES.BASE);
  }

  // --- Courses ---
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>(API_ENDPOINTS.COURSES.BASE);
  }

  async getCourseById(courseId: number | string): Promise<Course> {
    const endpoint = API_ENDPOINTS.COURSES.BY_ID(courseId);
    return this.request<Course>(endpoint);
  }

  // --- Events ---
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>(API_ENDPOINTS.EVENTS.BASE);
  }

  // --- User Specific Data (Examples) ---
  async getUserEnrollments(): Promise<Enrollment[]> {
    // Assumes the backend uses the token to identify the user
    const endpoint = API_ENDPOINTS.ENROLLMENTS.ME;
    return this.request<Enrollment[]>(endpoint);
  }

  async getUserCertifications(): Promise<Certification[]> {
     // Assumes the backend uses the token to identify the user
    const endpoint = API_ENDPOINTS.CERTIFICATIONS.ME;
    return this.request<Certification[]>(endpoint);
  }

   async getUserPayments(): Promise<Payment[]> {
     // Assumes the backend uses the token to identify the user
    const endpoint = API_ENDPOINTS.PAYMENTS.ME; // Assumes this endpoint exists
    return this.request<Payment[]>(endpoint);
  }

   async getUserReviews(): Promise<Review[]> {
     // Assumes the backend uses the token to identify the user
    const endpoint = API_ENDPOINTS.REVIEWS.ME; // Assumes this endpoint exists
    return this.request<Review[]>(endpoint);
  }

  // Add other specific API call methods here...
  // Example: Create Review
  // async createCourseReview(courseId: number, reviewData: ReviewCreate): Promise<Review> {
  //    const endpoint = API_ENDPOINTS.REVIEWS.CREATE_COURSE_REVIEW(courseId);
  //    return this.request<Review>(endpoint, {
  //        method: 'POST',
  //        body: JSON.stringify(reviewData)
  //    });
  // }
}

// Export a single instance for use throughout the app
export const apiService = new ApiService();

// Load token when service is initialized (will be async, but won't block import)
// AuthContext will handle setting the token after initial load completes anyway.
// apiService.loadTokenFromStorage(); // Optional: load token eagerly when service initializes