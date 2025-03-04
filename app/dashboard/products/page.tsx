"use client";

import ProductForm from "../../../components/ProductForm";
import ProductList from "../../../components/ProductList";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { Suspense } from "react";

export default function Products() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Product Management</h1>
          <ProductForm />
          <div className="mt-10">
            <Suspense>
              <ProductList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
