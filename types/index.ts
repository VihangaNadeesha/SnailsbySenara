export type Size = "XS" | "S" | "M" | "L";
export type Product = { id:string; name:string; slug:string; description:string; price:number; available_sizes:Size[]; inventory:number; is_available:boolean; display_order:number; image?:string };
export type Settings = { bank_name:string; account_name:string; account_number:string; branch:string; delivery_fee:number; whatsapp_number:string; google_review_url:string; instagram_url:string; facebook_url:string; tiktok_url:string; delivery_information:string };
export type CartItem = Product & { selectedSize:Size; quantity:number };
