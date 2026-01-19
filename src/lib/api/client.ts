import axios, { type AxiosInstance, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';


// Global rate limit handler - will be set by RateLimitProvider context
let globalRateLimitHandler: ((feature: string, currentTier: string, requiredTier: string) => void) | null = null;

export const setGlobalRateLimitHandler = (handler: typeof globalRateLimitHandler) => {
  globalRateLimitHandler = handler;
};

// API client config
// Handles auth, request/response interceptors and error management
class APIClient {
  private client: AxiosInstance;
  private baseURL: string = import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token to all requests except auth endpoints
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API REQ] ${config.method?.toUpperCase()} ${config.url}`);
        const isAuthEndpoint = config.url?.includes('/auth/login') ||
                               config.url?.includes('/auth/register') ||
                               config.url?.includes('/auth/refresh') ||
                               config.url?.includes('/auth/verify_callback');

        if (!isAuthEndpoint) {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }else{
            console.warn('[API REQ] No access token found');
          }
        }
        return config;
      },
      // (error) => Promise.reject(error)
      (error) => {
      console.error('[API REQ ERROR]', error);
      return Promise.reject(error);
    }
    );

    // Response interceptor - handle token refresh on 401
    this.client.interceptors.response.use(
      // (response: AxiosResponse) => response,
      (response: AxiosResponse) => {
      console.log(`[API RES] ${response.config.url} - ${response.status}`);
      return response;
    },

      async (error: AxiosError) => {
        const errorType = error.code === 'ECONNABORTED' ? 'TIMEOUT' : 
                    error.code === 'ERR_CANCELED' ? 'CANCELED' : 
                    error.response?.status || 'NETWORK_ERROR';
         console.error(`[API RES ERROR] ${error.config?.url} - ${errorType}`);
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 429 Rate Limit - Show upgrade modal
        if (error.response?.status === 429) {
          console.log('[API] Rate limit hit - triggering upgrade modal');
          const errorData = error.response?.data as any;
          const feature = errorData?.feature || 'API Requests';
          const currentTier = errorData?.current_tier || 'free';
          const requiredTier = errorData?.required_tier || 'basic';
          
          if (globalRateLimitHandler) {
            globalRateLimitHandler(feature, currentTier, requiredTier);
          }
          
          return Promise.reject(error);
        }

        // Only attempt refresh for 401 errors, not on refresh endpoint itself
        const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
        
        if ((error.response?.status === 401 || error.response?.status === 403) && originalRequest && !originalRequest._retry && !isRefreshEndpoint) {
          console.log('[API] Attempting token refresh...');
          
          if (this.isRefreshing) {
            console.log('[API] Already refreshing, queuing request');
            // Queue this request to retry after refresh completes
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Use raw axios to avoid interceptor loop
            const response = await axios.post(
              `${this.baseURL}/api/v1/auth/refresh/`,
              { refresh_token: refreshToken },
              { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000 
              }
            );

            const { access_token, refresh_token: new_refresh_token } = response.data;

            // Update stored tokens
            localStorage.setItem('access_token', access_token);
            if (new_refresh_token) {
              localStorage.setItem('refresh_token', new_refresh_token);
            }

            // Update default headers
            this.client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // Retry all queued requests with new token
            this.refreshSubscribers.forEach(callback => callback(access_token));
            this.refreshSubscribers = [];

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);

          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.refreshSubscribers = [];
            this.clearAuthTokens();
            
            // Only redirect if in browser environment
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Get the configured axios instance
  public getClient(): AxiosInstance {
    return this.client;
  }

  // Set auth tokens after login
  public setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  // Clear auth tokens on logout
  public clearAuthTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

// Singleton instance
export const apiClient = new APIClient();
export default apiClient;