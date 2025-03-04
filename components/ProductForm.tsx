// components/ProductForm.tsx
"use client";

import { useState } from "react";
import { Product } from "../lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "../lib/store";

export default function ProductForm() {
  // Local state with strings for input flexibility
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount: "",
    saleEnd: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});
  const { products, setProducts } = useAppStore();

  const validateForm = (data: typeof formData) => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    let isValid = true;

    // Name validation
    if (!data.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Price validation
    const priceNum = data.price === "" ? NaN : Number(data.price);
    if (data.price === "") {
      newErrors.price = "Price is required";
      isValid = false;
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Price must be a positive number";
      isValid = false;
    }

    // Discount validation
    const discountNum = data.discount === "" ? 0 : Number(data.discount);
    if (!isNaN(discountNum) && (discountNum < 0 || discountNum > 100)) {
      newErrors.discount = "Discount must be between 0 and 100";
      isValid = false;
    }

    // Sale End validation: required only if discount > 0
    if (discountNum > 0 && !data.saleEnd) {
      newErrors.saleEnd = "Sale end date is required for discounted products";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm(formData);
    if (!isValid) return;

    try {
      const newProduct: Omit<Product, "id" | "createdAt"> = {
        name: formData.name,
        price: Number(formData.price), // Convert to number for Product type
        discount: formData.discount === "" ? 0 : Number(formData.discount), // Convert, default to 0
        saleEnd: formData.saleEnd,
      };
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add product");
      const addedProduct = await res.json();
      setProducts([...products, addedProduct]);
      setFormData({ name: "", price: "", discount: "", saleEnd: "" });
      setErrors({});
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    validateForm(newFormData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 border rounded-lg mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-1">
          <Input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name}</p>
          )}
        </div>
        <div className="space-y-1">
          <Input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            step="0.01"
          />
          {errors.price && (
            <p className="text-destructive text-xs">{errors.price}</p>
          )}
        </div>
        <div className="space-y-1">
          <Input
            type="number"
            placeholder="Discount (%)"
            value={formData.discount}
            onChange={(e) => handleChange("discount", e.target.value)}
            step="1"
          />
          {errors.discount && (
            <p className="text-destructive text-xs">{errors.discount}</p>
          )}
        </div>
        <div className="space-y-1">
          <Input
            type="datetime-local"
            value={formData.saleEnd}
            onChange={(e) => handleChange("saleEnd", e.target.value)}
          />
          {errors.saleEnd && (
            <p className="text-destructive text-xs">{errors.saleEnd}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={
            Object.keys(errors).length > 0 ||
            !formData.name ||
            (Number(formData.discount) > 0 && !formData.saleEnd)
          }
        >
          Add Product
        </Button>
      </div>
    </form>
  );
}
