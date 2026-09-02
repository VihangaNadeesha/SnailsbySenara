import { getStorefront } from "@/lib/store";
import { Storefront } from "@/components/storefront";
export default async function Page(){ const data=await getStorefront(); return <Storefront {...data}/>; }
