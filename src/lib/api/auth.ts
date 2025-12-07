import apiClient from "./client";

// Auth API endpoints
// Handles user login, registration and token refresh

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

// User login with email and password
// @param credentials - User email and password
// @returns User data and authentication tokens
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.getClient().post<LoginResponse>(
    '/api/v1/auth/login/', 
    credentials
  );
  
  // Set tokens after successful login
  apiClient.setAuthTokens(response.data.access_token, response.data.refresh_token);
  
  return response.data;
};

// User registration with email and password
// @param credentials - User email and password
// @returns New user data and authentication tokens
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.getClient().post<RegisterResponse>(
    '/api/v1/auth/register/', 
    userData
  );
  
  // Only set tokens if they actually exist (they won't for unconfirmed users)
  if (response.data.access_token && response.data.refresh_token) {
    apiClient.setAuthTokens(response.data.access_token, response.data.refresh_token);
  }
  
  return response.data;
};

// Validate callback tokens from Supabase (OAuth or email verification)
// @param tokens - Access and refresh tokens from Supabase callback
// @returns User data, validated tokens, and subscription status
export const verifyCallback = async (tokens: { access_token: string; refresh_token: string }): Promise<LoginResponse & { has_subscription: boolean }> => {
  const response = await apiClient.getClient().post<LoginResponse & { has_subscription: boolean }>(
    '/api/v1/auth/verify_callback/',
    tokens
  );

  apiClient.setAuthTokens(response.data.access_token, response.data.refresh_token);

  return response.data;
};

// Refresh access token using refresh token
// @param refreshToken - Current refresh token
// @returns New access and refresh tokens
export const refreshToken = async (refreshToken: string): Promise<RefreshResponse> => {
  // This function is rarely needed - the interceptor handles refresh automatically(this is for yk manual stuff)
  const response = await apiClient.getClient().post<RefreshResponse>(
    '/api/v1/auth/refresh/', 
    { refresh_token: refreshToken }
  );
  
  // Update tokens
  const newRefreshToken = response.data.refresh_token || refreshToken;
  apiClient.setAuthTokens(response.data.access_token, newRefreshToken);
  
  return response.data;
};

// Logout user by clearing auth tokens
export const logout = (): void => {
  apiClient.clearAuthTokens();
};

// Check if user is currently authenticated
// @returns boolean indicating authentication status
export const isAuthenticated = (): boolean => {
  return apiClient.isAuthenticated();
};