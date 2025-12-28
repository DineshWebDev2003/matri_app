import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Load environment variables
const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '10.169.108.139';
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '8000';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${API_HOST}:${API_PORT}/api/mobile`;
const IMAGE_PROFILE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || `http://${API_HOST}:${API_PORT}/assets/images/user/profile`;
const IMAGE_GALLERY_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_GALLERY_BASE_URL || `http://${API_HOST}:${API_PORT}/assets/images/user/gallery`;

// Log API configuration on startup
console.log('🔧 API Configuration Loaded:');
console.log(`   Host: ${API_HOST}`);
console.log(`   Port: ${API_PORT}`);
console.log(`   Base URL: ${API_BASE_URL}`);
console.log(`   Profile Image URL: ${IMAGE_PROFILE_BASE_URL}`);
console.log(`   Gallery Image URL: ${IMAGE_GALLERY_BASE_URL}`);

// API endpoints configuration
const API_ENDPOINTS = {
  PRIMARY: API_BASE_URL,
  FALLBACK: API_BASE_URL,
  LOCAL: API_BASE_URL
};

// Create axios instance with better configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // STEP 1: 20 seconds timeout for slow networks
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});


// Add token to requests automatically - ensure headers object exists
// Note: Using a promise-based approach to properly handle async token retrieval
axiosInstance.interceptors.request.use((config: any) => {
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

// Add response interceptor to log responses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add retry logic and fallback mechanism
const withFallback = async (apiCall: () => Promise<any>, retries = 2) => {
  const endpoints = [API_ENDPOINTS.PRIMARY, API_ENDPOINTS.FALLBACK, API_ENDPOINTS.LOCAL];
  let lastError;

  for (let i = 0; i < retries; i++) {
    for (const baseURL of endpoints) {
      try {
        axiosInstance.defaults.baseURL = baseURL;
        const result = await apiCall();
        return result;
      } catch (error: any) {
        lastError = error;
        if (error.message === 'Network Error') {
          continue;
        }
        throw error;
      }
    }
  }
  
  throw lastError;
};

// API Service
export const apiService = {
  getGalleryImages() {
    return axiosInstance.get('/gallery-images');
  },
  api: axiosInstance,

  // Authentication methods
  async login(username: string, password: string) {
    try {
      // Create payload - API expects only 'username' field (can be email or username)
      const loginPayload = { username, password };
      
      // Log login attempt with full URL
      const loginUrl = `${axiosInstance.defaults.baseURL}/login`;
      console.log('🔐 Login Attempt:');
      console.log(`   Full URL: ${loginUrl}`);
      console.log(`   Username: ${username}`);
      console.log(`   Payload: ${JSON.stringify(loginPayload)}`);
      
      try {
        console.log(`📡 Sending POST request to: ${loginUrl}`);
        const response = await axiosInstance.post('/login', loginPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 20000 // 20 second timeout for slow networks
        });
        
        console.log('✅ Login successful!');
        if (response.data.status === 'success' && response.data.data?.access_token) {
          await SecureStore.setItemAsync('token', response.data.data.access_token);
          console.log('🔑 Token saved to SecureStore');
        }
        
        return response.data;
      } catch (error: any) {
        console.log('❌ Primary login attempt failed');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        
        // If primary attempt fails, try direct connection
        if (!error.response || error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          
          try {
            const fallbackUrl = `${API_BASE_URL}/login`;
            console.log(`📡 Trying fallback URL: ${fallbackUrl}`);
            const fallbackResp = await axios.post(fallbackUrl, loginPayload, {
              headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json'
              },
              timeout: 20000 // 20 second timeout for fallback
            });

            axiosInstance.defaults.baseURL = API_BASE_URL;
            
            console.log('✅ Fallback login successful!');
            if (fallbackResp.data.status === 'success' && fallbackResp.data.data?.access_token) {
              await SecureStore.setItemAsync('token', fallbackResp.data.data.access_token);
              console.log('🔑 Token saved to SecureStore');
            }
            return fallbackResp.data;
          } catch (fallbackError: any) {
            console.log('❌ Fallback login also failed');
            console.log(`   Error: ${fallbackError.message}`);
            throw new Error(`Both primary and fallback APIs failed. Check if Laravel server is running on ${API_HOST}:${API_PORT}`);
          }
        }
        throw error; // Re-throw if it's not a network error
      }
    } catch (error: any) {
      
      const errorMessage = error.response?.data?.message?.error?.join?.(', ') || 
                          error.response?.data?.message || 
                          error.message || 
                          'Login failed';
      throw new Error(errorMessage);
    }
  },

  async register(userData: any) {
    try {
      // Use URLSearchParams for form-encoded data (Laravel standard)
      const formData = new URLSearchParams();
      
      // Map all fields explicitly
      const fieldsToSend = {
        'looking_for': userData.looking_for,
        'firstname': userData.firstname,
        'lastname': userData.lastname,
        'email': userData.email,
        'mobile': userData.mobile,
        'birth_date': userData.birth_date,
        'password': userData.password,
        'password_confirmation': userData.password_confirmation,
        'religion': userData.religion,
        'caste': userData.caste,
        'username': userData.username,
        'mobile_code': userData.mobile_code,
        'country_code': userData.country_code,
        'country': userData.country,
        'agree': userData.agree,
      };
      
      Object.keys(fieldsToSend).forEach(key => {
        const value = fieldsToSend[key];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        } else {
        }
      });


      const response = await axiosInstance.post('/register', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      
      return response.data;
    } catch (error: any) {
      // Handle validation errors
      let errorMessage = 'Registration failed';
      if (error?.response?.data?.message?.error && Array.isArray(error.response.data.message.error)) {
        errorMessage = error.response.data.message.error.join('\n');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    const response = await axiosInstance.get('/logout');
    return response.data;
  },

  // User Data
  getUserInfo: async () => {
    return withFallback(async () => {
      const response = await axiosInstance.get('/user-info');
      return response.data;
    });
  },

  getDashboard: async () => {
    try {
      const response = await axiosInstance.get('/dashboard');
      console.log('📊 Dashboard API Response:', response.data);
      console.log('📊 Limitation data:', response.data?.data?.limitation);
      return response.data;
    } catch (error: any) {
      console.error('❌ Dashboard API Error:', error.message);
      return {
        status: 'error',
        data: {
          limitation: {
            interest_used: 0,
            contact_used: 0
          }
        }
      };
    }
  },

  getPackageInfo: async () => {
    try {
      console.log('📦 Fetching package information...');
      const response = await axiosInstance.get('/package-info');
      console.log('📦 Package info response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch package info:', error.message);
      return {
        status: 'error',
        message: 'Failed to fetch package information'
      };
    }
  },

  createRazorOrder: async (planId: number) => {
    try {
      const response = await axiosInstance.post('/razorpay/order', { plan_id: planId });
      return response.data;
    } catch (e:any) {
      console.error('⚠️ Razor order error', e.message);
      return { status:'error' };
    }
  },

  verifyRazorPayment: async (payload:any) => {
    try {
      const response = await axiosInstance.post('/razorpay/verify', payload);
      return response.data;
    } catch(e:any){
      console.error('⚠️ Razor verify error', e.message);
      return { status:'error' };
    }
  },

  getAllPlans: async () => {
    try {
      console.log('📋 Fetching all available plans...');
      const response = await axiosInstance.get('/all-plans');
      console.log('📋 All plans response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch all plans:', error.message);
      return {
        status: 'error',
        message: 'Failed to fetch plans',
        data: { plans: [] }
      };
    }
  },

  updateProfile: async (profileData: any) => {
    // Map of camelCase fields to their snake_case counterparts
    const fieldMap: Record<string, string> = {
      firstname: 'firstname',
      lastname: 'lastname',
      dateOfBirth: 'date_of_birth',
      religion: 'religion',
      gender: 'gender',
      profession: 'profession',
      motherTongue: 'mother_tongue',
      financialCondition: 'financial_condition',
      smokingHabits: 'smoking_habits',
      drinkingHabits: 'drinking_habits',
      maritalStatus: 'marital_status',
      caste: 'caste',
      spokenLanguages: 'spoken_languages',
      presentCountry: 'present_country',
      presentState: 'present_state',
      presentCity: 'present_city',
      presentZipCode: 'present_zip_code',
      presentAddress: 'present_address',
      permanentAddress: 'permanent_address',
      height: 'height',
      weight: 'weight',
      bloodGroup: 'blood_group',
      eyeColor: 'eye_color',
      hairColor: 'hair_color',
      complexion: 'complexion',
      disability: 'disability',
      fatherName: 'father_name',
      fatherProfession: 'father_profession',
      fatherContact: 'father_contact',
      motherName: 'mother_name',
      motherProfession: 'mother_profession',
      motherContact: 'mother_contact',
      numberOfBrothers: 'number_of_brothers',
      numberOfSisters: 'number_of_sisters',
      company: 'company',
      designation: 'designation',
      careerStartYear: 'career_start_year',
      careerEndYear: 'career_end_year',
      institute: 'institute',
      degree: 'degree',
      fieldOfStudy: 'field_of_study',
      educationStartYear: 'education_start_year',
      educationEndYear: 'education_end_year',
      partnerGeneralRequirement: 'partner_general_requirement',
      partnerCountry: 'partner_country',
      partnerMinAge: 'partner_min_age',
      partnerMaxAge: 'partner_max_age',
      partnerMinHeight: 'partner_min_height',
      partnerMaxHeight: 'partner_max_height',
      partnerMaritalStatus: 'partner_marital_status',
      partnerReligion: 'partner_religion',
      partnerComplexion: 'partner_complexion',
      partnerSmokingHabits: 'partner_smoking_habits',
      partnerDrinkingHabits: 'partner_drinking_habits',
      partnerSpokenLanguages: 'partner_spoken_languages',
      partnerEducation: 'partner_education',
      partnerProfession: 'partner_profession',
      partnerFinancialCondition: 'partner_financial_condition',
      partnerFamilyValues: 'partner_family_values',
    };

    // Build request payload by including ONLY provided fields
    const convertedData: Record<string, any> = {};

    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (fieldMap[key]) {
          convertedData[fieldMap[key]] = value; // camelCase -> snake_case
        } else {
          // If key is already snake_case or unrecognised camelCase, keep as is
          convertedData[key] = value;
        }
      }
    });

    console.log('📤 Converted profile data for API:', convertedData);

    const response = await axiosInstance.post('/user-info', convertedData);
    return response.data;
  },

  // Profile Steps API (New)
  getProfileStep: async (stepId: number) => {
    const response = await axiosInstance.get(`/profile-steps/${stepId}`);
    return response.data;
  },

  submitProfileStep: async (stepId: number, stepData: any) => {
    const response = await axiosInstance.post(`/profile-steps/${stepId}`, stepData);
    return response.data;
  },

  updateProfileStep: async (stepId: number, stepData: any) => {
    const response = await axiosInstance.put(`/profile-steps/${stepId}`, stepData);
    return response.data;
  },

  skipProfileStep: async (stepId: number) => {
    const response = await axiosInstance.post(`/profile-steps/${stepId}/skip`);
    return response.data;
  },

  unskipProfileStep: async (stepId: number) => {
    const response = await axiosInstance.post(`/profile-steps/${stepId}/unskip`);
    return response.data;
  },

  changePassword: async (passwordData: any) => {
    const response = await axiosInstance.post('/change-password', passwordData);
    return response.data;
  },

  // KYC
  getKycForm: async () => {
    const response = await axiosInstance.get('/kyc-form');
    return response.data;
  },

  submitKyc: async (kycData: any) => {
    const response = await axiosInstance.post('/kyc-submit', kycData);
    return response.data;
  },

  // Deposits/Payments
  getDepositMethods: async () => {
    const response = await axiosInstance.get('/deposit/methods');
    return response.data;
  },

  getDepositHistory: async () => {
    const response = await axiosInstance.get('/deposit/history');
    return response.data;
  },

  viewContact: async (profileId: string) => {
    const response = await axiosInstance.post('/contact/unlock', { contact_id: profileId });
    return response.data;
  },
  removeInterest: async (profileId: string) => {
    const response = await axiosInstance.delete(`/remove-interest/${profileId}`);
    return response.data;
  },


  getInterestRequests: async () => {
    const response = await axiosInstance.get('/interest-requests');
    return response.data;
  },

  getInterestedProfiles: async () => {
    const response = await axiosInstance.get('/interested-profiles');
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    try {
      console.log('📬 Fetching notifications...');
      const response = await axiosInstance.get('/notifications');
      console.log('📬 Notifications response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      return {
        status: 'error',
        data: []
      };
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      const response = await axiosInstance.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  },

  clearAllNotifications: async () => {
    try {
      console.log('🗑️ Clearing all notifications...');
      const response = await axiosInstance.post('/notifications/clear-all');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error clearing notifications:', error);
      throw error;
    }
  },

  updatePushToken: async (token: string) => {
    try {
      console.log('🔔 Updating push token:', token);
      const response = await axiosInstance.post('/push-token', { token });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating push token:', error);
      // Don't throw - this is optional
      return { status: 'error' };
    }
  },

  // Search
  searchProfiles: async (params: any) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Map filter type to appropriate parameter
      if (params.search) {
        queryParams.append('search', params.search);
      }
      if (params.location) {
        queryParams.append('location', params.location);
      }
      if (params.age) {
        queryParams.append('age', params.age.toString());
      }
      if (params.member_id) {
        queryParams.append('member_id', params.member_id.toString());
      }
      if (params.caste) {
        queryParams.append('caste', params.caste);
      }
      if (params.limit) {
        queryParams.append('per_page', params.limit.toString());
      } else {
        queryParams.append('per_page', '20');
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      
      const url = `/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      console.log('🔍 Calling search API:', url);
      const response = await axiosInstance.get(url);
      console.log('📊 Search response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Search error:', error);
      return {
        status: 'error',
        message: error.message,
        data: []
      };
    }
  },

  // Get members list using the correct endpoint
  getMembers: async (page: number = 1, perPage: number = 50) => {
    try {
      console.log(`📋 Fetching members (page ${page}, ${perPage} per page)...`);
      
      // Use the /members endpoint from the API
      const response = await axiosInstance.get(`/members?page=${page}&per_page=${perPage}`);

      console.log('✅ Members fetched successfully!');
      
      // Handle different response structures
      let members = [];
      let total = 0;
      let pagination = null;
      
      if (response.data && response.data.data && response.data.data.profiles && Array.isArray(response.data.data.profiles)) {
        members = response.data.data.profiles;
        pagination = response.data.data.pagination;
        total = pagination ? pagination.total : members.length;
      } else if (response.data && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        members = response.data.data.data;
        total = response.data.data.total || members.length;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        members = response.data.data;
        total = members.length;
      }
      
      console.log(`Total members: ${total}`);
      console.log(`Current page: ${page}`);
      console.log(`Per page: ${perPage}`);
      console.log(`Members in this page: ${members.length}`);
      
      if (pagination) {
        console.log(`Last page: ${pagination.last_page}`);
        console.log(`Has more: ${pagination.has_more}`);
      }
      
      return {
        status: 'success',
        data: {
          profiles: members,
          members: members,
          pagination: pagination || {
            current_page: page,
            last_page: 1,
            per_page: perPage,
            total: total,
            has_more: false
          }
        }
      };
    } catch (error: any) {
      console.error('❌ Get members error:', error.message);
      return {
        status: 'error',
        message: error.message || 'Failed to fetch members',
        data: { profiles: [] }
      };
    }
  },

  // Profiles/Users - Get real member data using new API endpoints
  getProfiles: async (params?: { type?: string; limit?: number; search?: string; page?: number; filters?: any }) => {
    try {
      // Use the new API endpoints we created
      const queryParams = new URLSearchParams();
      
      // Add type parameter (only once!)
      if (params?.type) {
        queryParams.append('type', params.type);
      }
      
      // STEP 2: Use pagination - default to 20 per page for fast response
      const limit = params?.limit || 20;
      queryParams.append('per_page', limit.toString());
      
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      // Add additional filters for recommendations and matching
      if (params?.filters) {
        Object.keys(params.filters).forEach(key => {
          if (params.filters[key] !== undefined && params.filters[key] !== null) {
            queryParams.append(key, params.filters[key].toString());
          }
        });
      }
      
      const endpoint = params?.search ? '/members/search' : '/new-members';
      const url = `${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      console.log('📡 API Request URL:', url);
      const response = await axiosInstance.get(url);
      
      // Handle Laravel API response format
      console.log('🔍 Raw API Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
      
      if (response.data && (response.data.status === 'success' || response.data.remark === 'members_list')) {
        // New endpoint returns 'profiles', old endpoint returns 'members'
        const profiles = response.data.data?.profiles || response.data.data?.members || [];
        const pagination = response.data.data?.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: profiles.length,
          total: profiles.length,
          has_more: false
        };
        
        console.log('📊 API Response profiles:', profiles.length);
        console.log('📊 First profile:', profiles[0]);
        console.log('📊 Pagination:', pagination);
        
        return {
          status: 'success',
          remark: response.data.remark,
          data: {
            profiles: profiles,
            members: profiles,
            pagination: pagination
          }
        };
      }
      
      console.log('⚠️ Unexpected response format:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ getProfiles error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Log the full error for debugging
      if (error.response?.data?.message) {
        console.error('❌ API Error Message:', error.response.data.message);
      }
      
      // Return empty data instead of fallback
      return {
        status: 'error',
        data: {
          profiles: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 0,
            total: 0,
            has_more: false
          }
        },
        error: error.message,
        errorCode: error.code,
        apiError: error.response?.data
      };
    }
  },

  getProfile: async (id: string) => {
    try {
      // Use the new getMember endpoint for individual profiles
      const response = await axiosInstance.get(`/new-members/${id}`);
      
      if (response.data.status === 'success') {
        const member = response.data.data.member;
        
        // Transform backend member data to mobile app profile format
        const transformedProfile = transformMemberToProfile(member);
        
        return {
          status: 'success',
          data: {
            profile: transformedProfile
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      // Return error instead of fallback
      return {
        status: 'error',
        data: {
          profile: null
        }
      };
    }
  },

  getAllProfiles: async () => {
    const response = await axiosInstance.get('/dashboard');
    return response.data;
  },


  // General Settings
  getGeneralSettings: async () => {
    const response = await axiosInstance.get('/general-setting');
    return response.data;
  },

  getCountries: async () => {
    const response = await axiosInstance.get('/get-countries');
    return response.data;
  },

  // Fetch religions (and other dropdown values)
  getDropdownOptions: async () => {
    try {
      // backend alias, try main endpoint first then fallback
      let response = await axiosInstance.get('/options');
      if (response?.data?.status !== 'success') {
        // fallback endpoint name
        response = await axiosInstance.get('/dropdown-options');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching dropdown options:', error);
      throw error;
    }
  },

  // Authorization
  getAuthorization: async () => {
    const response = await axiosInstance.get('/authorization');
    return response.data;
  },

  verifyEmail: async (verificationData: any) => {
    const response = await axiosInstance.post('/verify-email', verificationData);
    return response.data;
  },

  verifyMobile: async (verificationData: any) => {
    const response = await axiosInstance.post('/verify-mobile', verificationData);
    return response.data;
  },

  async getCastesByReligion(religionId: string | number) {
    try {
      const response = await axiosInstance.get(`/castes/${religionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching castes:', error);
      throw error;
    }
  },

  // Enhanced search members by name, caste, age, or profile ID
  async searchMembers(params: { query?: string; name?: string; caste?: string; age?: number; minAge?: number; maxAge?: number; limit?: number; page?: number }) {
    try {
      console.log('🔍 Enhanced search with params:', params);
      
      const searchParams = new URLSearchParams();
      
      // Add search parameters
      if (params.query) searchParams.append('q', params.query);
      if (params.name) searchParams.append('name', params.name);
      if (params.caste) searchParams.append('caste', params.caste);
      if (params.age) searchParams.append('age', params.age.toString());
      if (params.minAge) searchParams.append('min_age', params.minAge.toString());
      if (params.maxAge) searchParams.append('max_age', params.maxAge.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.page) searchParams.append('page', params.page.toString());
      
      const url = `/members/search${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      console.log('🌐 Search URL:', url);
      
      const response = await axiosInstance.get(url);
      console.log('✅ Enhanced search results retrieved:', response.data);
      
      // Transform the response to match expected format
      if (response.data.status === 'success' && response.data.data?.members) {
        const transformedProfiles = response.data.data.members.map((member: any) => transformMemberToProfile(member));
        return {
          status: 'success',
          data: {
            profiles: transformedProfiles,
            pagination: response.data.data.pagination
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Enhanced search failed:', error.response?.data || error.message);
      return {
        status: 'error',
        data: {
          profiles: [],
          pagination: { current_page: 1, last_page: 1, per_page: 0, total: 0 }
        },
        message: error.response?.data?.message || 'Search failed'
      };
    }
  },

  // Premium/Plans related methods
  async getPlans() {
    try {
      console.log('📋 Fetching available plans...');
      const response = await axiosInstance.get('/plans');
      return response.data;
    } catch (error: any) {
      console.error('❌ Plans fetch failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to fetch plans');
    }
  },

  async getUserPlan() {
    try {
      console.log('👤 Fetching user plan details...');
      const response = await axiosInstance.get('/user-plan');
      return response.data;
    } catch (error: any) {
      console.error('❌ User plan fetch failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to fetch user plan');
    }
  },

  async purchasePlan(planId: number) {
    try {
      console.log('💳 Purchasing plan:', planId);
      const response = await axiosInstance.post('/purchase-plan', { plan_id: planId });
      return response.data;
    } catch (error: any) {
      console.error('❌ Plan purchase failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Plan purchase failed');
    }
  },

  // === Interest APIs ===functionality
  async expressHeart(userId: string | number) {
    try {
      const response = await axiosInstance.post('/express-interest', { user_id: userId });
      return response.data;
    } catch (error: any) {
      console.error('❌ Express heart failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to send heart');
    }
  },

  async getHeartedProfiles() {
    try {
      const response = await axiosInstance.get('/hearted-profiles');
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetch hearted profiles failed', error);
      throw error;
    }
  },

  async getHeartRequests() {
    try {
      const response = await axiosInstance.get('/heart-requests');
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetch heart requests failed', error);
      throw error;
    }
  },

  async acceptHeart(userId: string | number) {
    try {
      const response = await axiosInstance.post('/accept-heart', { user_id: userId });
      return response.data;
    } catch (error: any) {
      console.error('❌ Accept heart failed', error);
      throw error;
    }
  },

  async ignoreHeart(userId: string | number) {
    try {
      const response = await axiosInstance.post('/ignore-heart', { user_id: userId });
      return response.data;
    } catch (error: any) {
      console.error('❌ Ignore heart failed', error);
      throw error;
    }
  },

  async getIgnoredHearts() {
    try {
      const response = await axiosInstance.get('/ignored-hearts');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get ignored hearts failed', error);
      throw error;
    }
  },

  async getShortlistedHearts() {
    try {
      const response = await axiosInstance.get('/shortlisted-hearts');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get shortlisted hearts failed', error);
      throw error;
    }
  },

  async expressInterest(userId: string | number) {
    try {
      console.log('💖 Expressing interest in user:', userId);
      const response = await axiosInstance.post('/express-interest', { user_id: userId });
      return response.data;
    } catch (error: any) {
      console.error('❌ Express interest failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to express interest');
    }
  },

  async removeInterest(userId: string | number) {
    try {
      console.log('💔 Removing interest from user:', userId);
      const response = await axiosInstance.delete(`/express-interest/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Remove interest failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to remove interest');
    }
  },
  async getInterestedProfiles() {
    try {
      const response = await axiosInstance.get('/interested-profiles');
      return response.data;
    } catch (error: any) {
      // Return empty array instead of throwing error to prevent app crashes
      return {
        status: 'success',
        data: {
          profiles: []
        },
        message: 'No interested profiles found'
      };
    }
  },

  async sendInterest(profileId: string) {
    try {
      console.log('💝 Sending interest to profile:', profileId);
      const response = await axiosInstance.post('/express-interest', { user_id: profileId });
      console.log('💝 Send interest response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Send interest failed:', error.response?.data || error.message);
      // return a consistent error object
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to send interest'
      };
    }
  },

  async getInterestRequests() {
    try {
      console.log('📥 Fetching interest requests...');
      console.log('🔗 API URL:', axiosInstance.defaults.baseURL + '/interest-requests');
      const response = await axiosInstance.get('/interest-requests');
      console.log('📥 Interest requests API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetch interest requests failed');
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Full error:', error);
      
      // Return empty array instead of throwing error
      return {
        status: 'success',
        data: {
          profiles: []
        },
        message: 'No interest requests found'
      };
    }
  },

  async ignoreProfile(userId: string | number) {
    try {
      console.log('🚫 Ignoring profile:', userId);
      const response = await axiosInstance.post('/ignore-profile', { user_id: userId });
      console.log('🚫 Ignore profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Ignore profile failed:', error.response?.data || error.message);
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to ignore profile'
      };
    }
  },

  async getIgnoredProfiles() {
    try {
      console.log('📋 Fetching ignored profiles...');
      console.log('🔗 API URL:', axiosInstance.defaults.baseURL + '/ignored-profiles');
      const response = await axiosInstance.get('/ignored-profiles');
      console.log('📋 Ignored profiles response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get ignored profiles failed');
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Full error:', error);
      
      // Return empty array instead of throwing error
      return {
        status: 'success',
        data: {
          profiles: []
        },
        message: 'No ignored profiles found'
      };
    }
  },

  async getShortlistedProfiles() {
    try {
      console.log('📌 Fetching shortlisted profiles...');
      console.log('🔗 API URL:', axiosInstance.defaults.baseURL + '/shortlisted-profiles');
      const response = await axiosInstance.get('/shortlisted-profiles');
      console.log('📌 Shortlisted profiles response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get shortlisted profiles failed');
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Full error:', error);
      
      // Return empty array instead of throwing error
      return {
        status: 'success',
        data: {
          profiles: [],
          pagination: {
            total: 0
          }
        },
        message: 'No shortlisted profiles found'
      };
    }
  },

  async acceptInterest(userId: string | number) {
    try {
      console.log('✅ Accepting interest from:', userId);
      const response = await axiosInstance.post('/accept-interest', { user_id: userId });
      console.log('✅ Accept interest response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Accept interest failed:', error.response?.data || error.message);
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to accept interest'
      };
    }
  },

  async uploadProfileImage(formData: FormData) {
    try {
      console.log('📸 Uploading profile image...');
      const response = await axiosInstance.post('/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('📸 Profile image upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile image upload failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to upload profile image');
    }
  },

  async uploadGalleryImage(formData: FormData) {
    try {
      console.log('🖼️ Uploading gallery image...');
      const response = await axiosInstance.post('/upload-gallery-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('🖼️ Gallery image upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Gallery image upload failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to upload gallery image');
    }
  },

  async getGalleryImages() {
    try {
      console.log('🖼️ Fetching gallery images...');
      const response = await axiosInstance.get('/gallery-images');
      console.log('🖼️ Gallery images response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetch gallery images failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to fetch gallery images');
    }
  },

  async viewContact(userId: string) {
    try {
      console.log('📞 Viewing contact for user:', userId);
      const response = await axiosInstance.post('/contact/unlock', { contact_id: userId });
      console.log('📞 Contact view response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Contact view failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to view contact');
    }
  },

  // Messaging API methods
  async getConversations() {
    try {
      console.log('💬 Fetching conversations...');
      const response = await axiosInstance.get('/conversations');
      console.log('💬 Conversations response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get conversations failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to fetch conversations');
    }
  },

  async getMessages(conversationId: string) {
    try {
      console.log('💬 Fetching messages for conversation:', conversationId);
      const response = await axiosInstance.get(`/conversations/${conversationId}/messages`);
      console.log('💬 Messages response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get messages failed:', error.response?.data || error.message);
      // Return error response instead of throwing for conversation lookup
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch messages',
        data: { messages: [] }
      };
    }
  },

  async sendMessage(conversationId: string, message: string) {
    try {
      console.log('💬 Sending message to conversation:', conversationId);
      const response = await axiosInstance.post(`/conversations/${conversationId}/messages`, {
        message
      });
      console.log('💬 Send message response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Send message failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to send message');
    }
  },

  async createConversation(receiverId: string, message: string) {
    try {
      console.log('💬 Creating conversation with user:', receiverId);
      const response = await axiosInstance.post('/conversations', {
        receiver_id: receiverId,
        message
      });
      console.log('💬 Create conversation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create conversation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to create conversation');
    }
  },

  async initiateCall(conversationId: string) {
    try {
      console.log('📞 Initiating voice call for conversation:', conversationId);
      const response = await axiosInstance.post(`/conversations/${conversationId}/call`);
      console.log('📞 Initiate call response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Initiate call failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to initiate call');
    }
  },

  async initiateVideoCall(conversationId: string) {
    try {
      console.log('📹 Initiating video call for conversation:', conversationId);
      const response = await axiosInstance.post(`/conversations/${conversationId}/video-call`);
      console.log('📹 Initiate video call response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Initiate video call failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to initiate video call');
    }
  },

  async markMessageAsRead(messageId: string) {
    try {
      console.log('✅ Marking message as read:', messageId);
      const response = await axiosInstance.put(`/messages/${messageId}/read`);
      console.log('✅ Mark as read response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark as read failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Failed to mark message as read');
    }
  },

};


// Debug helper — call this from your Expo app (e.g. useEffect) to test login
export const debugLoginTest = async () => {
  try {
    console.log('🧪 Running debugLoginTest...');
    const result = await apiService.login('nandhu382003@gmail.com', 'Nandhu@2003');
    console.log('🧪 debugLoginTest success:', result);
    return result;
  } catch (err: any) {
    console.error('🧪 debugLoginTest failed:', err?.message || err);
    throw err;
  }
};

// Helper function to transform backend member data to mobile app profile format
const transformMemberToProfile = (memberData: any) => {
  // Safely access nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Calculate age from birth_date if available
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  // Ensure memberData is not null/undefined
  if (!memberData) {
    memberData = {};
  }

  // Get package information for premium detection - check multiple possible locations
  const packageId = safeGet(memberData, 'user_limitation.package_id') || 
                   safeGet(memberData, 'package_id') || 
                   safeGet(memberData, 'user.package_id') ||
                   safeGet(memberData, 'limitation.package_id') || 4; // Default to FREE MATCH
  
  const packageName = safeGet(memberData, 'user_limitation.package.name') || 
                     safeGet(memberData, 'package_name') ||
                     safeGet(memberData, 'user.package_name') ||
                     'FREE MATCH';
  
  const expireDate = safeGet(memberData, 'user_limitation.expire_date') || 
                    safeGet(memberData, 'expire_date') ||
                    safeGet(memberData, 'user.expire_date');
  
  // Premium detection: package_id should be 1, 2, or 3 (not 4 which is FREE MATCH)
  const isPremium = packageId && packageId !== 4 && packageId > 0;

  // Transform backend member data to mobile app profile format based on actual API response
  const profile = {
    id: safeGet(memberData, 'id', '1')?.toString() || '1',
    name: `${safeGet(memberData, 'firstname', 'User')} ${safeGet(memberData, 'lastname', '')}`.trim(),
    firstname: safeGet(memberData, 'firstname', 'User'),
    lastname: safeGet(memberData, 'lastname', ''),
    age: calculateAge(safeGet(memberData, 'basic_info.birth_date')),
    height: safeGet(memberData, 'physical_attributes.height', 'N/A'),
    location: safeGet(memberData, 'basic_info.city') || safeGet(memberData, 'address.city') || 'N/A',
    city: safeGet(memberData, 'basic_info.city') || safeGet(memberData, 'address.city') || 'N/A',
    idNo: safeGet(memberData, 'profile_id') || `USR${safeGet(memberData, 'id', '1')?.toString().padStart(5, '0') || '00001'}`,
    profile_id: safeGet(memberData, 'profile_id'),
    images: safeGet(memberData, 'image') ? [`https://90skalyanam.com/assets/images/user/profile/${safeGet(memberData, 'image')}`] : 
            safeGet(memberData, 'galleries', []).length > 0 ? 
            safeGet(memberData, 'galleries', []).map((gallery: any) => `https://90skalyanam.com/assets/images/user/gallery/${gallery.image}`) :
            ['https://randomuser.me/api/portraits/women/1.jpg'],
    image: safeGet(memberData, 'image'),
    premium: isPremium,
    packageId: packageId,
    packageName: packageName,
    expireDate: expireDate,
    profileComplete: safeGet(memberData, 'profile_complete') === '1',
    lookingFor: safeGet(memberData, 'looking_for', '1'),
    kycVerified: safeGet(memberData, 'kv') === '1',
    emailVerified: safeGet(memberData, 'ev') === '1',
    mobileVerified: safeGet(memberData, 'sv') === '1',
    joinedDate: safeGet(memberData, 'created_at') || new Date().toISOString(),
    isNewlyJoined: true,
    
    // Additional profile details with safe access from actual API structure
    dob: safeGet(memberData, 'basic_info.birth_date', 'N/A'),
    education: safeGet(memberData, 'education_info.0.degree', 'N/A'),
    born: '1st Born',
    star: safeGet(memberData, 'basic_info.star', 'N/A'),
    rassi: safeGet(memberData, 'basic_info.rassi', 'N/A'),
    bloodGroup: safeGet(memberData, 'physical_attributes.blood_group', 'N/A'),
    maritalStatus: safeGet(memberData, 'basic_info.marital_status', 'N/A'),
    job: safeGet(memberData, 'career_info.0.designation') || safeGet(memberData, 'basic_info.profession', 'N/A'),
    salary: safeGet(memberData, 'career_info.0.annual_income') || safeGet(memberData, 'basic_info.financial_condition', 'N/A'),
    birthPlace: safeGet(memberData, 'basic_info.birth_place') || safeGet(memberData, 'basic_info.city', 'N/A'),
    birthTime: safeGet(memberData, 'basic_info.birth_time', 'N/A'),
    fatherName: safeGet(memberData, 'family.father_name', 'N/A'),
    fatherOccupation: safeGet(memberData, 'family.father_occupation', 'N/A'),
    motherName: safeGet(memberData, 'family.mother_name', 'N/A'),
    motherOccupation: safeGet(memberData, 'family.mother_occupation', 'N/A'),
    siblings: safeGet(memberData, 'family.siblings', 'N/A'),
    ownHouse: safeGet(memberData, 'family.own_house', 'N/A'),
    ownPlot: safeGet(memberData, 'family.own_plot', 'N/A'),
    familyStatus: safeGet(memberData, 'family.family_status', 'N/A'),
    familyType: safeGet(memberData, 'family.family_type', 'N/A'),
    diet: safeGet(memberData, 'physical_attributes.diet', 'N/A'),
    patham: '****',
    lagnam: '****',
    horoscopeType: 'Dosham',
    doshamType: '****',
    married: '1',
    
    // Religion info from actual API structure
    religion: safeGet(memberData, 'basic_info.religion', 'N/A'),
    caste: safeGet(memberData, 'basic_info.caste', 'N/A'),
    motherTongue: safeGet(memberData, 'basic_info.mother_tongue', 'N/A'),
    
    // Physical attributes
    complexion: safeGet(memberData, 'physical_attributes.complexion', 'N/A'),
    bodyType: safeGet(memberData, 'physical_attributes.body_type', 'N/A'),
    
    // Partner expectations
    partnerAgeMin: safeGet(memberData, 'partner_expectation.min_age', 22),
    partnerAgeMax: safeGet(memberData, 'partner_expectation.max_age', 35),
    partnerHeightMin: safeGet(memberData, 'partner_expectation.min_height', '150cm'),
    partnerHeightMax: safeGet(memberData, 'partner_expectation.max_height', '180cm'),
    
    // Additional fields from API response
    gender: safeGet(memberData, 'basic_info.gender', 'N/A'),
    smokingStatus: safeGet(memberData, 'basic_info.smoking_status', 'N/A'),
    drinkingStatus: safeGet(memberData, 'basic_info.drinking_status', 'N/A'),
    country: safeGet(memberData, 'basic_info.country', 'N/A'),
    state: safeGet(memberData, 'basic_info.state', 'N/A'),
    mobile: safeGet(memberData, 'mobile', 'N/A'),
    email: safeGet(memberData, 'email', 'N/A'),
  };

  return profile;
};

// Helper function to transform real user data to profile format
const transformUserToProfile = (userData: any, type: string) => {
  // Safely access nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Calculate age from birth_date if available
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 25; // Default age
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 25;
    }
  };

  // Ensure userData is not null/undefined
  if (!userData) {
    userData = {};
  }

  // Transform real user data to profile format with safe property access
  const profile = {
    id: safeGet(userData, 'id', '1')?.toString() || '1',
    name: `${safeGet(userData, 'firstname', 'User')} ${safeGet(userData, 'lastname', '')}`.trim(),
    firstname: safeGet(userData, 'firstname', 'User'),
    lastname: safeGet(userData, 'lastname', ''),
    age: safeGet(userData, 'birth_date') ? calculateAge(safeGet(userData, 'birth_date')) : 25,
    height: safeGet(userData, 'height', '165cm'),
    location: safeGet(userData, 'city') || safeGet(userData, 'address.city') || 'Chennai',
    idNo: `USR${safeGet(userData, 'id', '1')?.toString().padStart(5, '0') || '00001'}`,
    images: safeGet(userData, 'image') ? [`https://90skalyanam.com/assets/images/user/profile/${safeGet(userData, 'image')}`] : ['https://randomuser.me/api/portraits/women/1.jpg'],
    premium: (safeGet(userData, 'package_id', 0) > 0) || false,
    profileComplete: safeGet(userData, 'reg_step') === 1,
    lookingFor: safeGet(userData, 'looking_for', '1'),
    kycVerified: safeGet(userData, 'kv') === 1,
    emailVerified: safeGet(userData, 'ev') === 1,
    mobileVerified: safeGet(userData, 'sv') === 1,
    joinedDate: safeGet(userData, 'created_at') || new Date().toISOString(),
    isNewlyJoined: true,
    
    // Additional profile details with safe access
    dob: safeGet(userData, 'birth_date', '01/01/1999'),
    education: safeGet(userData, 'education', 'Graduate'),
    born: '1st Born',
    star: safeGet(userData, 'star', 'Rohini'),
    rassi: safeGet(userData, 'rassi', 'Taurus'),
    bloodGroup: safeGet(userData, 'blood_group', 'O +ve'),
    maritalStatus: safeGet(userData, 'marital_status', 'Never Married'),
    job: safeGet(userData, 'profession', 'Professional'),
    salary: safeGet(userData, 'income', '5-7 LPA'),
    birthPlace: safeGet(userData, 'birth_place') || safeGet(userData, 'city', 'Chennai'),
    birthTime: safeGet(userData, 'birth_time', '10:00 AM'),
    fatherName: safeGet(userData, 'father_name', 'Father'),
    fatherOccupation: safeGet(userData, 'father_occupation', 'Business'),
    motherName: safeGet(userData, 'mother_name', 'Mother'),
    motherOccupation: safeGet(userData, 'mother_occupation', 'Homemaker'),
    siblings: safeGet(userData, 'siblings', '1 Brother'),
    ownHouse: safeGet(userData, 'own_house', 'Yes'),
    ownPlot: safeGet(userData, 'own_plot', 'No'),
    familyStatus: safeGet(userData, 'family_status', 'Middle class'),
    familyType: safeGet(userData, 'family_type', 'Nuclear family'),
    diet: safeGet(userData, 'diet', 'Vegetarian'),
    patham: '****',
    lagnam: '****',
    horoscopeType: 'Dosham',
    doshamType: '****',
    married: '1',
  };

  return profile;
};

// Premium utility functions
export const premiumUtils = {
  // Check if user is premium based on package ID
  isPremiumUser: (packageId: number | string) => {
    const id = typeof packageId === 'string' ? parseInt(packageId) : packageId;
    return id && id !== 4 && id > 0; // 4 is FREE MATCH, 1,2,3 are premium
  },

  // Get package tier name
  getPackageTier: (packageId: number | string) => {
    const id = typeof packageId === 'string' ? parseInt(packageId) : packageId;
    switch (id) {
      case 1: return 'BASIC';
      case 2: return 'PREMIUM';
      case 3: return 'ELITE';
      case 4: return 'FREE';
      default: return 'FREE';
    }
  },

  // Get package color for UI
  getPackageColor: (packageId: number | string) => {
    const id = typeof packageId === 'string' ? parseInt(packageId) : packageId;
    switch (id) {
      case 1: return '#FF6B6B'; // Red for Basic
      case 2: return '#FFD700'; // Gold for Premium
      case 3: return '#9B59B6'; // Purple for Elite
      case 4: return '#95A5A6'; // Gray for Free
      default: return '#95A5A6';
    }
  },

  // Check if package is expired
  isPackageExpired: (expireDate: string | null) => {
    if (!expireDate) return false;
    return new Date(expireDate) < new Date();
  }
};

// All mock data removed - using only real API data

export default apiService;
