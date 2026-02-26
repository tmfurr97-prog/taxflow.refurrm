/**
 * Stripe client-side configuration.
 * Stripe integration is handled via the server-side Stripe MCP.
 */
export const STRIPE_PRICE_IDS = {
  weekly: 'price_weekly_placeholder',
  monthly: 'price_monthly_placeholder',
  annual: 'price_annual_placeholder',
};

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export async function createCheckoutSession(_priceId: string, _userId: string): Promise<{ url: string | null; error: string | null }> {
  return { url: null, error: 'Stripe not configured yet. Please contact support.' };
}

export async function manageSubscription(_action: string, _subscriptionId: string): Promise<{ error: string | null }> {
  return { error: null };
}

export async function getSubscriptionDetails(_userId: string): Promise<{ data: null; error: string | null }> {
  return { data: null, error: null };
}

export async function getInvoices(_userId: string): Promise<{ data: never[]; error: string | null }> {
  return { data: [], error: null };
}

