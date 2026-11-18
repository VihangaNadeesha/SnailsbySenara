"use client";

import { createClient } from "@supabase/supabase-js";
import { FormEvent, useEffect, useState } from "react";

const client = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total: number;
  status: string;
  submitted_at: string;
  order_items: {
    product_name: string;
    selected_size: string;
    quantity: number;
    line_total: number;
  }[];
};

const statuses = ["PENDING_APPROVAL_1", "PENDING_APPROVAL_2", "APPROVED", "DECLINED"];
const label = (status: string) => status.replaceAll("_", " ");

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const sb =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL
      ? client()
      : null;

  const load = async () => {
    if (!sb) return;
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;
    setReady(true);
    const { data, error: queryError } = await sb
      .from("orders")
      .select("*,order_items(product_name,selected_size,quantity,line_total)")
      .order("submitted_at", { ascending: false });
    if (queryError) setError("Your account does not have access to the admin area.");
    else setOrders(data || []);
  };

  useEffect(() => {
    void load();
    // This initial session check intentionally runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!sb) return setError("Supabase environment variables are required.");
    const { error: loginError } = await sb.auth.signInWithPassword({ email, password });
    if (loginError) setError("Unable to sign in. Please check your details.");
    else await load();
  }

  async function action(id: string, decision: "approve" | "decline") {
    if (!sb) return;
    const {
      data: { session },
    } = await sb.auth.getSession();
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session?.access_token || ""}`,
      },
      body: JSON.stringify({ decision }),
    });
    if (!response.ok) setError("That approval action could not be completed.");
    await load();
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f6f1] p-5">
        <form onSubmit={login} className="w-full max-w-sm bg-white p-7 shadow-sm">
          <p className="eyebrow">Snails by Senara</p>
          <h1 className="display mt-3 text-4xl">Admin sign in</h1>
          <p className="mt-3 text-sm text-[#8a8785]">For authorized staff only.</p>
          <input required type="email" className="field mt-6" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" className="field mt-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button className="button-dark mt-5 w-full">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f1]">
      <header className="border-b border-black/10 bg-[#f5f6f1]">
        <div className="shell flex h-16 items-center justify-between">
          <b className="display text-xl">Snails by Senara <small className="font-sans text-xs">Admin</small></b>
          <button onClick={() => { void sb?.auth.signOut(); setReady(false); }} className="text-xs underline">Sign out</button>
        </div>
      </header>
      <div className="shell py-10">
        <p className="eyebrow">Order management</p>
        <h1 className="display mt-3 text-4xl">Dashboard</h1>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statuses.map((status) => (
            <div className="border border-black/10 bg-white p-5" key={status}>
              <p className="text-[10px] tracking-wider text-[#9a657b]">{label(status)}</p>
              <b className="display mt-2 block text-3xl">{orders.filter((order) => order.status === status).length}</b>
            </div>
          ))}
        </div>
        {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
        <section className="mt-10 overflow-x-auto bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-[10px] tracking-wider text-[#9a657b]">
              <tr><th className="p-4">ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>STATUS</th><th>TOTAL</th><th>ACTION</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr className="border-b last:border-0" key={order.id}>
                  <td className="p-4 font-semibold">#{order.order_number}</td>
                  <td>{order.customer_name}<small className="block text-[#9a657b]">{order.customer_phone}</small></td>
                  <td>{order.order_items.map((item) => <small className="block" key={item.product_name + item.selected_size}>{item.product_name} · {item.selected_size} ×{item.quantity}</small>)}</td>
                  <td><span className="text-xs">{label(order.status)}</span></td>
                  <td>Rs. {order.total.toLocaleString()}</td>
                  <td>{order.status.startsWith("PENDING") && <div className="flex gap-2"><button onClick={() => action(order.id, "approve")} className="border border-[#1f1f1f] px-3 py-2 text-xs">Approve</button><button onClick={() => action(order.id, "decline")} className="px-3 py-2 text-xs underline">Decline</button></div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <p className="p-8 text-sm text-[#8a8785]">No orders to show.</p>}
        </section>
      </div>
    </main>
  );
}
