#!/usr/bin/env python3
"""
Supabase Database Schema Setup Script
Creates all necessary tables for the Snails by Senara e-commerce platform
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load environment variables
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("[!] Error: Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local")
    exit(1)

# Initialize Supabase client with service role key
client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

# SQL statements to create tables
CREATE_TABLES_SQL = """
-- Create Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Products (Nail Sets) table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Bank Payment Details table
CREATE TABLE IF NOT EXISTS public.bank_payments (
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
);

-- Create Cart table
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Create Addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
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
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_bank_payments_order_id ON public.bank_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
"""

def main():
    try:
        print("[*] Starting database schema setup...\n")
        print("[*] Supabase URL: {}".format(SUPABASE_URL))
        
        # Test connection
        print("\n[*] Testing Supabase connection...")
        result = client.table('information_schema.tables').select('*').limit(1).execute()
        print("[+] Connection successful!\n")
        
        # Execute SQL
        print("[*] Creating database schema...")
        print("-" * 50)
        
        # Split and execute statements
        statements = [
            stmt.strip() 
            for stmt in CREATE_TABLES_SQL.split(';') 
            if stmt.strip() and not stmt.strip().startswith('--')
        ]
        
        successful = 0
        failed = 0
        
        for i, statement in enumerate(statements, 1):
            stmt_preview = statement[:60].replace('\n', ' ') + ('...' if len(statement) > 60 else '')
            print("\n[{}/{}] {}".format(i, len(statements), stmt_preview))
            
            try:
                # Execute via RPC if available, otherwise try direct query
                result = client.rpc('exec', {'query': statement + ';'}).execute()
                print("     [+] Success")
                successful += 1
            except Exception as e:
                # Try to execute directly if RPC fails
                try:
                    result = client.postgrest.table(statement).execute()
                    print("     [+] Success (direct)")
                    successful += 1
                except:
                    # Some statements might fail if they already exist - that's ok
                    if "already exists" in str(e) or "duplicate key" in str(e):
                        print("     [~] Already exists (skipped)")
                        successful += 1
                    else:
                        print("     [-] {}".format(str(e)[:80]))
                        failed += 1
        
        print("\n" + "-" * 50)
        print("\n[*] Results:")
        print("    [+] Successful: {}".format(successful))
        print("    [-] Failed: {}".format(failed))
        
        if failed == 0:
            print("\n[+] Database schema created successfully!")
            print("\n[*] Tables created:")
            print("    . users")
            print("    . products")
            print("    . orders")
            print("    . order_items")
            print("    . bank_payments")
            print("    . cart")
            print("    . addresses")
        else:
            print("\n[!] {} statement(s) failed".format(failed))
            
    except Exception as e:
        print("\n[-] Error: {}".format(str(e)))
        exit(1)

if __name__ == "__main__":
    main()
