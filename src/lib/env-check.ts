// Environment variables validation utility
// Use this to debug environment issues in production

export function validateEnvironment() {
  const requiredEnvVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const serverOnlyEnvVars = {
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const optionalEnvVars = {
    'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL,
    'NEXT_PUBLIC_VERCEL_ANALYTICS_ID': process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  };

  console.log('🔍 Environment Variables Check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Check required client-side variables
  console.log('\n📋 Required Client-Side Variables:');
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    const status = value ? '✅ SET' : '❌ MISSING';
    const displayValue = value ? `${value.substring(0, 20)}...` : 'undefined';
    console.log(`${key}: ${status} (${displayValue})`);
  });

  // Check server-only variables (only log if we're on server)
  if (typeof window === 'undefined') {
    console.log('\n🔒 Server-Only Variables:');
    Object.entries(serverOnlyEnvVars).forEach(([key, value]) => {
      const status = value ? '✅ SET' : '❌ MISSING';
      const displayValue = value ? `${value.substring(0, 10)}...` : 'undefined';
      console.log(`${key}: ${status} (${displayValue})`);
    });
  }

  // Check optional variables
  console.log('\n⚙️ Optional Variables:');
  Object.entries(optionalEnvVars).forEach(([key, value]) => {
    const status = value ? '✅ SET' : '⚠️ NOT SET';
    const displayValue = value ? `${value.substring(0, 20)}...` : 'undefined';
    console.log(`${key}: ${status} (${displayValue})`);
  });

  // Return validation result
  const missingRequired = Object.entries(requiredEnvVars).filter(([_, value]) => !value);
  const isValid = missingRequired.length === 0;

  if (!isValid) {
    console.error('\n❌ Missing required environment variables:', missingRequired.map(([key]) => key));
  } else {
    console.log('\n✅ All required environment variables are set');
  }

  return {
    isValid,
    missingRequired: missingRequired.map(([key]) => key),
    environment: process.env.NODE_ENV,
  };
}

// Helper function to check Supabase configuration specifically
export function validateSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔍 Supabase Configuration Check:');
  
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
    return false;
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    return false;
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
    console.log('✅ Supabase URL format is valid');
  } catch {
    console.error('❌ Supabase URL format is invalid');
    return false;
  }

  // Validate anon key format (should be a JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error('❌ Supabase anon key format is invalid (should be JWT)');
    return false;
  }

  console.log('✅ Supabase configuration is valid');
  return true;
}

// Call this in development to check environment setup
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only run on client-side in development
  setTimeout(() => {
    validateEnvironment();
    validateSupabaseConfig();
  }, 1000);
}
