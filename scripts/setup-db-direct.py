#!/usr/bin/env python3
"""
Supabase Database Schema Setup via Direct SQL Execution
"""

import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv

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

# SQL statements to create tables
CREATE_TABLES_SQL = [
    """CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""",
    
    """CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""",
    
    """CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""",
    
    """CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""",
    
    """CREATE TABLE IF NOT EXISTS public.bank_payments (
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
);""",
    
    """CREATE TABLE IF NOT EXISTS public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);""",
    
    """CREATE TABLE IF NOT EXISTS public.addresses (
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
);""",
    
    # Indexes
    "CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);",
    "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);",
    "CREATE INDEX IF NOT EXISTS idx_bank_payments_order_id ON public.bank_payments(order_id);",
    "CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);",
]

def execute_sql_via_curl(sql_statement):
    """Execute SQL using curl and psql connection string"""
    try:
        # Try to construct a connection string from Supabase URL
        # Format: postgresql://postgres:password@host:port/database
        # We'll use psql if available via the Supabase CLI
        
        # For now, we'll create a PostgreSQL connection using pg8000
        import pg8000.native
        
        # Parse Supabase URL to get connection details
        # https://your-project.supabase.co -> tcjwvnxshhwsmibdwcoh.db.supabase.co
        url_parts = SUPABASE_URL.replace('https://', '').replace('http://', '').split('.')
        project_id = url_parts[0]
        
        # Connect to Supabase PostgreSQL
        conn = pg8000.native.connect(
            host=f"{project_id}.db.supabase.co",
            user="postgres",
            password=SERVICE_ROLE_KEY,
            database="postgres",
            ssl=True
        )
        
        cursor = conn.cursor()
        cursor.execute(sql_statement)
        conn.commit()
        cursor.close()
        conn.close()
        
        return True, "Success"
    except Exception as e:
        return False, str(e)

def main():
    try:
        print("[*] Starting database schema setup...\n")
        print("[*] Supabase URL: {}".format(SUPABASE_URL))
        
        print("\n[*] Installing pg8000 for direct PostgreSQL connection...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pg8000', '-q'], check=True)
        
        print("\n[*] Creating database schema...")
        print("-" * 50)
        
        successful = 0
        failed = 0
        
        for i, statement in enumerate(CREATE_TABLES_SQL, 1):
            stmt_preview = statement[:60].replace('\n', ' ') + ('...' if len(statement) > 60 else '')
            print("\n[{}/{}] {}".format(i, len(CREATE_TABLES_SQL), stmt_preview))
            
            success, msg = execute_sql_via_curl(statement)
            
            if success:
                print("     [+] Success")
                successful += 1
            else:
                if "already exists" in msg.lower() or "duplicate key" in msg.lower():
                    print("     [~] Already exists (skipped)")
                    successful += 1
                else:
                    print("     [-] {}".format(msg[:80]))
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
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()
