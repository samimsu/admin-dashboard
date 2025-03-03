// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, Clock } from "lucide-react";
import { useAppStore } from "../../lib/store";

export default function Dashboard() {
  const router = useRouter();
  const { products, setProducts, logout } = useAppStore();

  useEffect(() => {
    if (!products.length) {
      const fetchProducts = async () => {
        const res = await fetch("/api/products", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      };
      fetchProducts();
    }
  }, [products, setProducts]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/login");
  };

  const totalProducts = products.length;
  const productsOnSale = products.filter((p) => p.discount > 0).length;
  const upcomingExpirations = products.filter((p) => {
    const now = new Date();
    const saleEnd = new Date(p.saleEnd);
    const diffInDays =
      (saleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 0 && diffInDays <= 7;
  }).length;

  const handleWidgetClick = (filterType: string) => {
    const params = new URLSearchParams();
    if (filterType === "onSale") {
      params.set("discount", "yes");
    } else if (filterType === "upcoming") {
      params.set("saleStatus", "upcoming");
    }
    router.push(
      `/dashboard/products${params.toString() ? "?" + params.toString() : ""}`
    );
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar onLogout={handleLogout} />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome!</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow bg-blue-100 rounded-2xl shadow-sm border border-gray-200"
              onClick={() => handleWidgetClick("all")}
            >
              <CardHeader className="flex items-center space-x-3">
                <Package className="text-blue-500 h-6 w-6" />
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">
                  {totalProducts}
                </p>
                <p className="text-sm text-gray-600">
                  All products in inventory
                </p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow bg-purple-100 rounded-2xl shadow-sm border border-gray-200"
              onClick={() => handleWidgetClick("onSale")}
            >
              <CardHeader className="flex items-center space-x-3">
                <Tag className="text-purple-500 h-6 w-6" />
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Products on Sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  {productsOnSale}
                </p>
                <p className="text-sm text-gray-600">
                  Currently discounted items
                </p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow bg-orange-100 rounded-2xl shadow-sm border border-gray-200"
              onClick={() => handleWidgetClick("upcoming")}
            >
              <CardHeader className="flex items-center space-x-3">
                <Clock className="text-orange-500 h-6 w-6" />
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Upcoming Expirations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-500">
                  {upcomingExpirations}
                </p>
                <p className="text-sm text-gray-600">
                  Sales ending within 7 days
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
