@echo off
cd /d "C:\Users\v.hemachandra\.copilot\repos\copilot-worktrees\SnailsbySenara\vihanganadeesha-redesigned-carnival"
curl -X POST "http://localhost:3004/api/orders" ^
  -F "name=Test Customer" ^
  -F "phone=0123456789" ^
  -F "address=123 Test Street Test City 12345" ^
  -F "slip=@C:\Users\V012E~1.HEM\AppData\Local\Temp\test-slip.png" ^
  -F "items=[{\"product_id\":\"af23a4c1-0db9-47eb-bf29-5141cdcdc0a8\",\"selected_size\":\"M\",\"quantity\":1}]"
