# 🎯 MANUAL STEPS 1-6 (DO THESE IN SUPABASE DASHBOARD)

You need to complete these steps in the Supabase UI. After you complete them, 
steps 7-9 will run automatically.

## STEP 1: Create Database Tables
- Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/sql
- Click "New Query"
- Copy-paste the SQL from EXECUTE_NOW.md STEP 1 section
- Click "Run"
- Wait for "Executed successfully"

## STEP 2: Create Storage Buckets
- Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/storage/buckets
- Click "New Bucket"
- Name: product-images
- ✓ Check "Public bucket"
- Click "Create Bucket"
- Repeat for: payment-slips (leave as Private)

## STEP 3: Upload 21 Images
- Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/storage/buckets/product-images
- Click "Upload file"
- Select all 21 PNG files from: public\nails\
- Wait for upload to complete
- Verify all 21 files appear in the list

## STEP 4: Insert 21 Products
- Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/sql
- Click "New Query"
- Copy-paste the SQL from EXECUTE_NOW.md STEP 4 section
- Click "Run"
- Wait for "Executed successfully"

## STEP 5: Link Images to Products
- In the same SQL Editor
- Click "New Query"
- Copy-paste the SQL from EXECUTE_NOW.md STEP 5 section
- Click "Run"
- Wait for "Executed successfully"

## STEP 6: Get Your API Keys
- Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/settings/api
- Under "Project API keys" copy:
  - anon (public) key
  - service_role key

AFTER completing steps 1-6, provide the API keys and I'll automatically:
- Update .env.local (STEP 7)
- Restart the app (STEP 8)
- Test everything (STEP 9)

Then your Snails by Senara platform will be LIVE! 🚀
