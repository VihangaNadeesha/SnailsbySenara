import { demoProducts, placeholderSettings } from "@/lib/demo";
import { supabaseServer } from "@/lib/supabase/server";
import type { Product, Settings } from "@/types";

const fallbackSettings: Settings = {
  ...placeholderSettings,
  bank_name: "Bank Of Ceylon",
  account_name: "K.T.Senara",
  account_number: "84766542",
  branch: "Deniyaya",
};

export async function getStorefront(): Promise<{ products: Product[]; settings: Settings }> {
  const sb = supabaseServer();
  
  // If no Supabase connection or error, use demo products
  if (!sb) {
    return { products: demoProducts, settings: fallbackSettings };
  }

  try {
    const [{ data: products }, { data: settings }] = await Promise.all([
      sb
        .from("products")
        .select("*, product_images(storage_path,display_order)")
        .eq("is_available", true)
        .order("display_order"),
      sb.from("business_settings").select("*").limit(1).maybeSingle(),
    ]);

    // If no products from database, use demo products
    if (!products || products.length === 0) {
      return { products: demoProducts, settings: settings || fallbackSettings };
    }

    return {
      products: (products || []).map((p: Product & { product_images?: { storage_path: string }[] }) => {
        const path = p.product_images?.[0]?.storage_path;
        return {
          ...p,
          image: path ? sb.storage.from("product_images").getPublicUrl(path).data.publicUrl : undefined,
        };
      }),
      settings: settings || fallbackSettings,
    };
  } catch (error) {
    // If any error occurs, return demo products
    console.error("Error fetching from Supabase:", error);
    return { products: demoProducts, settings: fallbackSettings };
  }
}

