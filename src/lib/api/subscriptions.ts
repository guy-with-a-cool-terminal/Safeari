import apiClient from "./client";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_profiles: number;
  max_devices: number;
  analytics_retention: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: 'active' | 'pending_verification' | 'cancelled' | 'expired' | 'pending_upgrade';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  provider: 'paystack';
  authorization_code?: string;
  list_entries_limit?: number;
  features?: string[];
}

export interface CreateSubscriptionRequest {
  tier: string;
  provider: 'paystack' | 'manual';
}

export interface CreateSubscriptionResponse {
  id: string;
  authorization_url: string;
  reference: string;
  public_key: string;
  email: string;
  amount_kobo: number;
  tier: string;
  status: 'pending_verification';
  user_id: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export interface UsageSummary {
  tier: string;
  billing_period: {
    start: string;
    end: string;
  };
  usage: {
    profiles_created: number;
    api_calls: number;
  };
  limits: {
    profiles: number;
    active_profiles: number;
  };
}

export interface Invoice {
  id: number;
  invoice_number: string;
  amount: string;
  currency: string;
  issued_at: string;
  paid_at: string;
  pdf_url: string;
  status: 'paid';
  subscription: number;
  payment_transaction: number;
}

export interface PaymentHistory {
  id: number;
  amount: string;
  currency: string;
  status: string;
  payment_method: string;
  transaction_reference: string;
  created_at: string;
  metadata: Record<string, any>;
}

// ============================================================
// SUBSCRIPTION TIER ENDPOINTS
// ============================================================

export const getSubscriptionTiers = async (): Promise<SubscriptionTier[]> => {
  const response = await apiClient.getClient().get<any>('/api/v1/subscriptions/tiers/');
  return Object.entries(response.data).map(([id, tierData]: [string, any]) => ({
    id,
    name: tierData.name,
    description: tierData.description,
    price_monthly: tierData.price,
    price_yearly: tierData.price * 12,
    features: tierData.features,
    max_profiles: tierData.profile_limit,
    max_devices: 10,
    analytics_retention: tierData.analytics_days
  }));
};

// ============================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================

export const getCurrentSubscription = async (): Promise<Subscription> => {
  const response = await apiClient.getClient().get<Subscription>('/api/v1/subscriptions/current/');
  return response.data;
};

export const createSubscription = async (
  subscriptionData: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> => {
  const response = await apiClient.getClient().post<CreateSubscriptionResponse>(
    '/api/v1/subscriptions/',
    subscriptionData
  );
  return response.data;
};

export const cancelSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const response = await apiClient.getClient().post<Subscription>(
    `/api/v1/subscriptions/${subscriptionId}/cancel/`
  );
  return response.data;
};

export const cancelPendingSubscription = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.getClient().post<{ success: boolean; message: string }>(
    '/api/v1/subscriptions/cancel-pending/'
  );
  return response.data;
};

export const getPaymentHistory = async (subscriptionId: string): Promise<PaymentHistory[]> => {
  const response = await apiClient.getClient().get<PaymentHistory[]>(
    `/api/v1/subscriptions/${subscriptionId}/payment_history/`
  );
  return response.data;
};

// USAGE & LIMITS
export const getUsageSummary = async (): Promise<UsageSummary> => {
  const response = await apiClient.getClient().get<UsageSummary>(
    '/api/v1/subscriptions/usage/'
  );
  return response.data;
};

// INVOICES
export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.getClient().get<Invoice[]>('/api/v1/invoices/');
  return response.data;
};

export const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  const response = await apiClient.getClient().get<Invoice>(`/api/v1/invoices/${invoiceId}/`);
  return response.data;
};