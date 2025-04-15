
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

interface RequestConfig {
  method?: string;
  body?: Record<string, any>;
}

export async function makeRpcRequest<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'POST', body } = config;
  
  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}
