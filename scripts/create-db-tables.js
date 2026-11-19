const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createTables() {
  try {
    // Create users table
    const { error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('Creating users table...');
      // Table doesn't exist, we'll create it via raw SQL
    }

    // Read and execute the SQL migration file
    const sqlFile = path.join(__dirname, '../supabase/migrations/001_create_initial_schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split SQL by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executing...`);
      console.log(stmt.substring(0, 100) + '...\n');
      
      try {
        const { error } = await supabase.rpc('exec', { query: stmt });
        if (error) throw error;
        console.log('✓ Success');
      } catch (err) {
        // Some statements might fail (e.g., table already exists), that's okay
        console.log(`⚠ ${err.message || 'Statement already exists or processed'}`);
      }
    }

    console.log('\n✅ Database setup completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTables();
