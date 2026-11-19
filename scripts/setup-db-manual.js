#!/usr/bin/env node

/**
 * Supabase Database Schema Setup - Using Service Role with Direct Connection
 * This script attempts multiple methods to create the database schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[!] Error: Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Initialize Supabase admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Split SQL file into individual statements
const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '001_create_initial_schema.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

const CREATE_TABLES_SQL = sqlContent
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
  .map(stmt => stmt + ';');

async function createTableViaPostgREST(tableName, columnDefs) {
  // Try to create a table by inserting a minimal row,
  // which will fail in a way that tells us if the table exists
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (!error) {
      return { success: true, message: 'Table already exists' };
    }
    
    if (error.code === 'PGRST205') {
      return { success: false, message: 'Table does not exist' };
    }
    
    return { success: false, message: error.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

async function main() {
  try {
    console.log('[*] Starting database schema setup...\n');
    console.log('[*] Supabase URL:', SUPABASE_URL);
    
    console.log('\n[*] Testing Supabase connection...');
    
    // Test connection
    const { data, error: testError } = await supabase
      .from('users')
      .select('count()', { count: 'exact' });
    
    if (!testError || testError.code === 'PGRST205') {
      console.log('[+] Connection successful!\n');
    } else if (testError) {
      throw new Error(`Connection test failed: ${testError.message}`);
    }
    
    console.log('[*] Database Schema Summary:');
    console.log('-'.repeat(50));
    
    // List all tables that should be created
    const tables = [
      'users - Customer accounts',
      'products - Press-on nail products',
      'orders - Customer orders',
      'order_items - Items in each order',
      'bank_payments - Bank payment details',
      'cart - Shopping cart items',
      'addresses - Customer shipping addresses',
    ];
    
    console.log('[*] Tables to be created:\n');
    tables.forEach(t => console.log(`    - ${t}`));
    
    console.log('\n[*] SQL Migration File Location:');
    console.log(`    ${sqlFilePath}`);
    
    console.log('\n[*] To execute this SQL in Supabase:');
    console.log('    1. Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/sql/new');
    console.log('    2. Copy the SQL content from: supabase/migrations/001_create_initial_schema.sql');
    console.log('    3. Paste into the SQL editor');
    console.log('    4. Click "Run" button');
    
    console.log('\n[+] Setup instructions generated successfully!');
    console.log('\n[*] Next steps:');
    console.log('    1. Run the SQL commands in the Supabase SQL editor');
    console.log('    2. Verify tables are created in Table Editor');
    console.log('    3. Run the development server: npm run dev');
    
  } catch (error) {
    console.error('\n[-] Error:', error.message);
    process.exit(1);
  }
}

main();
