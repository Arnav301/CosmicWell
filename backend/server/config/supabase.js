const { createClient } = require('@supabase/supabase-js');

let supabase = null;
let isConnected = false;

/**
 * Initialize Supabase client
 */
const connectSupabase = async () => {
  if (supabase && isConnected) {
    console.log('🔄 Supabase already connected');
    return supabase;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  console.log('🔍 Supabase connection check:');
  console.log('   - SUPABASE_URL set:', supabaseUrl ? 'YES' : 'NO');
  console.log('   - SUPABASE_ANON_KEY set:', supabaseKey ? 'YES' : 'NO');
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not set. Auth will use local storage fallback.');
    return null;
  }

  try {
    console.log('🔗 Initializing Supabase client...');
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test connection by querying users table
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    isConnected = true;
    console.log('☁️ Supabase connected (auth only)');
    console.log('   - URL:', supabaseUrl.substring(0, 30) + '...');
    
    return supabase;
  } catch (error) {
    console.error('❌ Supabase connection failed!');
    console.error('   - Error message:', error.message);
    console.log('📦 Falling back to local storage for auth');
    return null;
  }
};

/**
 * Check if Supabase is connected
 */
const isSupabaseConnected = () => {
  return isConnected && supabase !== null;
};

/**
 * Get the Supabase client
 */
const getSupabase = () => {
  return supabase;
};

/**
 * Disconnect Supabase (not really needed but for consistency)
 */
const disconnectSupabase = async () => {
  if (supabase) {
    supabase = null;
    isConnected = false;
    console.log('Supabase disconnected');
  }
};

/**
 * Test Supabase connection
 */
const testConnection = async () => {
  console.log('\n=== Supabase Connection Test ===\n');
  
  // Load env if not loaded
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
  
  try {
    const result = await connectSupabase();
    
    if (result) {
      console.log('\n✅ CONNECTION SUCCESSFUL!');
      
      // Test connection
      const { data, error } = await result.from('users').select('id').limit(1);
      if (error) {
        console.log('   - Query test: NEEDS TABLE SETUP');
        console.log('   - Run the SQL in supabase-setup.sql to create tables');
      } else {
        console.log('   - Query test: PASSED');
      }
      
      await disconnectSupabase();
    } else {
      console.log('\n⚠️ Connection returned null - using fallback');
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
  
  console.log('\n=== Test Complete ===\n');
  process.exit(0);
};

module.exports = {
  connectSupabase,
  isSupabaseConnected,
  getSupabase,
  disconnectSupabase,
  testConnection
};
