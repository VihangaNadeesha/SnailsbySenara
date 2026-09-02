import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Snails by Senara | Press-On Nails & Beauty", description: "Shop beautiful press-on nails from Snails by Senara. Nails | Lashes. Choose your favorite design, add to cart, make your payment, and easily complete your order online.", openGraph: { title: "Snails by Senara | Press-On Nails & Beauty", description: "Beautiful, reusable press-on nails designed with care." } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
