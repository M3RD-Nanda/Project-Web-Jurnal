// Debug utilities for production troubleshooting

export function logEnvironment() {
  // Environment logging removed for production
}

export function logError(error: any, context: string) {
  console.error(`[${context}] Error:`, {
    message: error?.message || "Unknown error",
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    context,
  });
}

export function logChartRender(chartName: string, data: any) {
  // Chart render logging removed for production
}

export function logSupabaseQuery(table: string, query: any, result: any) {
  // Supabase query logging removed for production
}
