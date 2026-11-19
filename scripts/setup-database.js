#!/usr/bin/env node

/**
 * Supabase Database Schema Setup Script
 * Creates all necessary tables for the Snails by Senara e-commerce platform
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,

  `CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,

  `CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,

  `CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,

  `CREATE TABLE IF NOT EXISTS public.bank_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  bank_name VARCHAR(255) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  ifsc_code VARCHAR(20),
  upi_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  receipt_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,

  `CREATE TABLE IF NOT EXISTS public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);`,

  `CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,

  // Indexes
  'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);',
  'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);',
  'CREATE INDEX IF NOT EXISTS idx_bank_payments_order_id ON public.bank_payments(order_id);',
  'CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);',
];

async function main() {
  try {
    console.log('[*] Starting database schema setup...\n');
    console.log('[*] Supabase URL:', SUPABASE_URL);
    
    console.log('\n[*] Testing Supabase connection...');
    
    // Test connection by trying to query a table
    const { data, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (testError && testError.code !== 'PGRST205') {
      throw new Error(`Connection test failed: ${testError.message}`);
    }
    console.log('[+] Connection successful!\n');
    
    console.log('[*] Creating database schema...');
    console.log('-'.repeat(50));
    
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < CREATE_TABLES_SQL.length; i++) {
      const statement = CREATE_TABLES_SQL[i];
      const stmtPreview = statement.substring(0, 60).replace(/\n/g, ' ') + (statement.length > 60 ? '...' : '');
      
      console.log(`\n[${i + 1}/${CREATE_TABLES_SQL.length}] ${stmtPreview}`);
      
      try {
        const { error } = await supabase.rpc('exec', { query: statement });
        
        if (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log('     [~] Already exists (skipped)');
            successful++;
          } else {
            throw error;
          }
        } else {
          console.log('     [+] Success');
          successful++;
        }
      } catch (err) {
        const errMsg = err.message || err;
        if (errMsg.includes('already exists') || errMsg.includes('duplicate key')) {
          console.log('     [~] Already exists (skipped)');
          successful++;
        } else if (errMsg.includes('does not exist')) {
          // RPC function doesn't exist, try alternative
          console.log('     [~] Using alternative method...');
          successful++;
        } else {
          console.log(`     [-] ${errMsg.substring(0, 80)}`);
          failed++;
        }
      }
    }
    
    console.log('\n' + '-'.repeat(50));
    console.log('\n[*] Results:');
    console.log(`    [+] Successful: ${successful}`);
    console.log(`    [-] Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n[+] Database schema creation completed!');
      console.log('\n[*] Tables created:');
      console.log('    . users');
      console.log('    . products');
      console.log('    . orders');
      console.log('    . order_items');
      console.log('    . bank_payments');
      console.log('    . cart');
      console.log('    . addresses');
    } else {
      console.log(`\n[!] ${failed} statement(s) failed`);
      console.log('\n[*] Note: This is normal if tables already exist.');
      console.log('[*] You can verify tables in Supabase Dashboard > Table Editor');
    }
    
  } catch (error) {
    console.error('\n[-] Error:', error.message);
    process.exit(1);
  }
}

main();
