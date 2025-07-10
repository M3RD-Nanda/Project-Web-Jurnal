// Debug utilities for production troubleshooting

export function logEnvironment() {
  if (typeof window !== 'undefined') {
    console.log('Client Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      userAgent: navigator.userAgent,
      location: window.location.href,
    });
  }
}

export function logError(error: any, context: string) {
  console.error(`[${context}] Error:`, {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    context,
  });
}

export function logChartRender(chartName: string, data: any) {
  console.log(`[${chartName}] Rendering with data:`, {
    dataLength: Array.isArray(data) ? data.length : 'Not an array',
    data: data,
    timestamp: new Date().toISOString(),
  });
}

export function logSupabaseQuery(table: string, query: any, result: any) {
  console.log(`[Supabase] Query to ${table}:`, {
    query,
    resultLength: result?.data?.length || 0,
    error: result?.error?.message || null,
    timestamp: new Date().toISOString(),
  });
}
