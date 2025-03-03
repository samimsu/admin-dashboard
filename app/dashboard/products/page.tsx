"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductForm from "../../../components/ProductForm";
import ProductList from "../../../components/ProductList";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar onLogout={handleLogout} />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Product Management</h1>
          <ProductForm />
          <div className="mt-10">
            <ProductList filter={filter} />
          </div>
        </div>
      </div>
    </div>
  );
}
