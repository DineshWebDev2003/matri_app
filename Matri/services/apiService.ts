/**
 * Professional API Service
 * Centralized API management with consistent request/response handling
 */

import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '172.16.200.139';
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '8000';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${API_HOST}:${API_PORT}/api`;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  remark?: string;
}

interface Profile {
  id: number;
  firstname: string;
  lastname: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  age: number;
  image: string; // Full URL
  profileImage: string; // Full URL
  location: string;
  city: string;
  state: string;
  country: string;
  religion: string;
  caste: string;
  height: string | null;
  weight: string | null;
  blood_group: string;
  premium: boolean;
  kycVerified: boolean;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_image: string; // Full URL
  other_user_gender: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: Profile;
}

interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  username: string;
  password: string;
  looking_for: string;
  country: string;
  country_code: string;
  mobile_code: string;
  religion_id: string;
  caste: string;
  gender: string;
  birth_date: string;
  agree: boolean;
}

interface PaginationParams {
  page?: number;
  per_page?: number;
  limit?: number;
  type?: string;
}

interface ProfilesResponse {
  profiles: Profile[];
  total: number;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor - Add authentication token
  // Note: Using a promise-based approach to properly handle async token retrieval
  instance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    
    // Return a promise that resolves with the config after token is retrieved
    return SecureStore.getItemAsync('token').then((token) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token injected for request:', config.url);
      } else {
        console.log('⚠️ No token found for request:', config.url);
      }
      return config;
    }).catch((error) => {
      console.warn('⚠️ Failed to retrieve token from SecureStore:', error);
      return config;
    });
  });

  // Response interceptor - Handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized
        SecureStore.deleteItemAsync('token');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

// ============================================================================
// API SERVICE CLASS
// ============================================================================

export class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axiosInstance;
  }

  // ========================================================================
  // AUTHENTICATION ENDPOINTS
  // ========================================================================

  /**
   * Login user with credentials
   * POST /login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      
      if (response.data.status === 'success' && response.data.data?.access_token) {
        await SecureStore.setItemAsync('token', response.data.data.access_token);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Login failed');
    }
  }

  /**
   * Register new user
   * POST /register
   */
  async register(userData: RegisterRequest): Promise<ApiResponse> {
    try {
      const formData = new URLSearchParams();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      const response = await this.api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Registration failed');
    }
  }

  /**
   * Logout user
   * GET /logout
   */
  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.api.get('/logout');
      await SecureStore.deleteItemAsync('token');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Logout failed');
    }
  }

  // ========================================================================
  // USER PROFILE ENDPOINTS
  // ========================================================================

  /**
   * Get full profile settings for current user
   * GET /profile-settings
   */
  async getProfileSettings(): Promise<ApiResponse> {
    try {
      const response = await this.api.get('/profile-settings');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch profile settings');
    }
  }

  /**
   * Update basic information section of profile
   * POST /profile-settings/basic
   */
  async updateBasicInfo(data: any): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/profile-settings/basic', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to update basic info');
    }
  }

  /**
   * Get current user info
   * GET /user-info
   */
  async getUserInfo(): Promise<ApiResponse<Profile>> {
    try {
      const response = await this.api.get('/user-info');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch user info');
    }
  }

  /**
   * Get dashboard data
   * GET /dashboard
   */
  async getDashboard(): Promise<ApiResponse> {
    try {
      const response = await this.api.get('/dashboard');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch dashboard');
    }
  }

  /**
   * Update user profile
   * POST /profile/update
   */
  async updateProfile(profileData: any): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/profile/update', profileData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to update profile');
    }
  }

  // ========================================================================
  // PROFILES/MEMBERS ENDPOINTS
  // ========================================================================

  /**
   * Get all members/profiles with pagination
   * GET /members?type=all&per_page=20&page=1
   */
  async getProfiles(params?: PaginationParams): Promise<ApiResponse<ProfilesResponse>> {
    try {
      const response = await this.api.get('/members', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch profiles');
    }
  }

  /**
   * Get single member/profile by ID
   * GET /members/{id}
   */
  async getProfile(profileId: number): Promise<ApiResponse<Profile>> {
    try {
      const response = await this.api.get(`/members/${profileId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch profile');
    }
  }

  /**
   * Search members
   * GET /members/search?query=name&per_page=20
   */
  async searchMembers(query: string, params?: PaginationParams): Promise<ApiResponse<ProfilesResponse>> {
    try {
      const response = await this.api.get('/members/search', {
        params: { query, ...params }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Search failed');
    }
  }

  // ========================================================================
  // INTEREST ENDPOINTS
  // ========================================================================

  /**
   * Get profiles user is interested in (sent interests)
   * GET /interested-profiles
   */
  async getInterestedProfiles(params?: PaginationParams): Promise<ApiResponse<ProfilesResponse>> {
    try {
      const response = await this.api.get('/interested-profiles', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch interested profiles');
    }
  }

  /**
   * Get interest requests (received interests)
   * GET /interest-requests
   */
  async getInterestRequests(params?: PaginationParams): Promise<ApiResponse<ProfilesResponse>> {
    try {
      const response = await this.api.get('/interest-requests', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch interest requests');
    }
  }

  /**
   * Get ignored profiles
   * GET /ignored-profiles
   */
  async getIgnoredProfiles(params?: PaginationParams): Promise<ApiResponse<ProfilesResponse>> {
    try {
      const response = await this.api.get('/ignored-profiles', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch ignored profiles');
    }
  }

  /**
   * Express interest in a profile
   * POST /express-interest/{profileId}
   */
  async expressInterest(profileId: number): Promise<ApiResponse> {
    try {
      const response = await this.api.post(`/express-interest/${profileId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to express interest');
    }
  }

  /**
   * Accept interest request
   * POST /accept-interest/{profileId}
   */
  async acceptInterest(profileId: number): Promise<ApiResponse> {
    try {
      const response = await this.api.post(`/accept-interest/${profileId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to accept interest');
    }
  }

  /**
   * Reject interest request
   * POST /reject-interest/{profileId}
   */
  async rejectInterest(profileId: number): Promise<ApiResponse> {
    try {
      const response = await this.api.post(`/reject-interest/${profileId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to reject interest');
    }
  }

  /**
   * Ignore a profile
   * POST /ignore-profile/{profileId}
   */
  async ignoreProfile(profileId: number): Promise<ApiResponse> {
    try {
      const response = await this.api.post(`/ignore-profile/${profileId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to ignore profile');
    }
  }

  // ========================================================================
  // CHAT/CONVERSATION ENDPOINTS
  // ========================================================================

  /**
   * Get all conversations (chat list)
   * GET /conversations
   */
  async getConversations(params?: PaginationParams): Promise<ApiResponse<ConversationsResponse>> {
    try {
      const response = await this.api.get('/conversations', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch conversations');
    }
  }

  /**
   * Get messages for a conversation
   * GET /conversations/{conversationId}/messages
   */
  async getMessages(conversationId: number, params?: PaginationParams): Promise<ApiResponse> {
    try {
      const response = await this.api.get(`/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch messages');
    }
  }

  /**
   * Send message
   * POST /conversations/{conversationId}/messages
   */
  async sendMessage(conversationId: number, message: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post(`/conversations/${conversationId}/messages`, { message });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to send message');
    }
  }

  // ========================================================================
  // GALLERY ENDPOINTS
  // ========================================================================

  /**
   * Get user gallery images
   * GET /gallery
   */
  async getGalleryImages(): Promise<ApiResponse> {
    try {
      const response = await this.api.get('/gallery');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch gallery');
    }
  }

  /**
   * Upload gallery image
   * POST /gallery/upload
   */
  async uploadGalleryImage(imageData: FormData): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/gallery/upload', imageData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to upload image');
    }
  }

  
  // ========================================================================
  // CAREER ENDPOINTS
  // -----------------------------------------------------------------------
  /** List careers */
  async getCareers(): Promise<ApiResponse> {
    return await this.api.get('/profile-settings/careers').then(r => r.data);
  }
  /** Create career */
  async createCareer(data: any): Promise<ApiResponse> {
    return await this.api.post('/profile-settings/careers', data).then(r => r.data);
  }
  /** Update career */
  async updateCareer(id: number, data: any): Promise<ApiResponse> {
    return await this.api.put(`/profile-settings/careers/${id}`, data).then(r => r.data);
  }
  /** Delete career */
  async deleteCareer(id: number): Promise<ApiResponse> {
    return await this.api.delete(`/profile-settings/careers/${id}`).then(r => r.data);
  }

  // EDUCATION ENDPOINTS
  // -----------------------------------------------------------------------
  /** List educations */
  async getEducations(): Promise<ApiResponse> {
    return await this.api.get('/profile-settings/educations').then(r => r.data);
  }
  /** Create education */
  async createEducation(data: any): Promise<ApiResponse> {
    return await this.api.post('/profile-settings/educations', data).then(r => r.data);
  }
  /** Update education */
  async updateEducation(id: number, data: any): Promise<ApiResponse> {
    return await this.api.put(`/profile-settings/educations/${id}`, data).then(r => r.data);
  }
  /** Delete education */
  async deleteEducation(id: number): Promise<ApiResponse> {
    return await this.api.delete(`/profile-settings/educations/${id}`).then(r => r.data);
  }

  // PROFILE OTHER SECTIONS ENDPOINTS
  // -----------------------------------------------------------------------
  /**
   * Update physical attributes
   * POST /profile-settings/physical-attributes
   */
  async updatePhysicalAttributes(data: any): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/profile-settings/physical-attributes', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to update physical attributes');
    }
  }

  /**
   * Update family information
   * POST /profile-settings/family-info
   */
  async updateFamilyInfo(data: any): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/profile-settings/family-info', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to update family information');
    }
  }

  /**
   * Update partner expectation
   * POST /profile-settings/partner-expectation
   */
  async updatePartnerExpectation(data: any): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/profile-settings/partner-expectation', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to update partner expectation');
    }
  }

  // LOCATION ENDPOINTS
  // ========================================================================
  /**
   * Fetch list of states used in profile settings dropdowns
   * GET /locations/states
   */
  async getStates(): Promise<Record<string, string>> {
    try {
      const response = await this.api.get('/locations/states');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch states');
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Handle API errors consistently
   */
  private handleError(error: any, defaultMessage: string): Error {
    const message = 
      error.response?.data?.message?.error?.join?.(', ') ||
      error.response?.data?.message ||
      error.message ||
      defaultMessage;

    return new Error(message);
  }

  /**
   * Get axios instance for direct access if needed
   */
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const apiService = new APIService();
