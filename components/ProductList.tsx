// components/ProductList.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "../lib/types";
import CountdownTimer from "./CountdownTimer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppStore } from "../lib/store";
import { Check, Pencil, Trash2, X } from "lucide-react";

type FilterState = {
  name: string;
  minPrice: string;
  maxPrice: string;
  discount: "all" | "yes" | "no";
  saleStatus: "all" | "active" | "ended" | "upcoming";
};

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    products,
    filters,
    setProducts,
    updateProduct,
    deleteProduct,
    setFilters,
    resetFilters,
  } = useAppStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    price: string;
    discount: string;
    saleEnd: string;
  }>({ name: "", price: "", discount: "", saleEnd: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  useEffect(() => {
    const initialFilters = {
      name: searchParams.get("name") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      discount: (searchParams.get("discount") as "all" | "yes" | "no") || "all",
      saleStatus:
        (searchParams.get("saleStatus") as
          | "all"
          | "active"
          | "ended"
          | "upcoming") || "all",
    };
    setFilters(initialFilters);
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.discount !== "all") params.set("discount", filters.discount);
    if (filters.saleStatus !== "all")
      params.set("saleStatus", filters.saleStatus);
    router.push(`/dashboard/products?${params.toString()}`, { scroll: false });
    applyFilters(products, filters);
  }, [filters, products, router]);

  const applyFilters = (data: Product[], currentFilters: FilterState) => {
    let result = [...data];

    if (currentFilters.name) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(currentFilters.name.toLowerCase())
      );
    }

    if (currentFilters.minPrice) {
      result = result.filter((p) => p.price >= Number(currentFilters.minPrice));
    }
    if (currentFilters.maxPrice) {
      result = result.filter((p) => p.price <= Number(currentFilters.maxPrice));
    }

    if (currentFilters.discount === "yes") {
      result = result.filter((p) => p.discount > 0);
    } else if (currentFilters.discount === "no") {
      result = result.filter((p) => p.discount === 0);
    }

    if (currentFilters.saleStatus === "active") {
      result = result.filter((p) => new Date(p.saleEnd) > new Date());
    } else if (currentFilters.saleStatus === "ended") {
      result = result.filter((p) => new Date(p.saleEnd) <= new Date());
    } else if (currentFilters.saleStatus === "upcoming") {
      result = result.filter((p) => {
        const now = new Date();
        const saleEnd = new Date(p.saleEnd);
        const diffInDays =
          (saleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffInDays > 0 && diffInDays <= 7;
      });
    }

    setFilteredProducts(result);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters({ [key]: value });
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: String(product.price),
      discount: String(product.discount),
      saleEnd: product.saleEnd,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: "", price: "", discount: "", saleEnd: "" });
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEdit = async (id: string) => {
    const updates: Partial<Product> = {
      name: editForm.name,
      price: Number(editForm.price),
      discount: editForm.discount === "" ? 0 : Number(editForm.discount),
      saleEnd: editForm.saleEnd,
    };

    if (!updates?.name?.trim()) {
      alert("Name is required");
      return;
    }
    if (isNaN(updates?.price || 0) || (updates?.price || 0) <= 0) {
      alert("Price must be a positive number");
      return;
    }
    if (
      !isNaN(updates?.discount || 0) &&
      ((updates?.discount || 0) < 0 || (updates?.discount || 0) > 100)
    ) {
      alert("Discount must be between 0 and 100");
      return;
    }
    if ((updates?.discount || 0) > 0 && !updates.saleEnd) {
      alert("Sale end date is required for discounted products");
      return;
    }

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include",
    });

    if (res.ok) {
      updateProduct(id, updates);
      setEditingId(null);
      setEditForm({ name: "", price: "", discount: "", saleEnd: "" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    const res = await fetch(`/api/products/${deleteId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      deleteProduct(deleteId);
      setIsDialogOpen(false);
      setDeleteId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name-filter">Name</Label>
          <Input
            id="name-filter"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="col-span-1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min-price-filter">Min Price</Label>
          <Input
            id="min-price-filter"
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            step="0.01"
            className="col-span-1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-price-filter">Max Price</Label>
          <Input
            id="max-price-filter"
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            step="0.01"
            className="col-span-1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount-filter">Discount</Label>
          <Select
            value={filters.discount}
            onValueChange={(value) => handleFilterChange("discount", value)}
          >
            <SelectTrigger id="discount-filter" className="col-span-1 w-full">
              <SelectValue placeholder="Discount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale-status-filter">Sale Status</Label>
          <Select
            value={filters.saleStatus}
            onValueChange={(value) => handleFilterChange("saleStatus", value)}
          >
            <SelectTrigger
              id="sale-status-filter"
              className="col-span-1 w-full"
            >
              <SelectValue placeholder="Sale Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="upcoming">Upcoming (7 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length}{" "}
          {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead className="min-w-[180px]">Sale End</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  {editingId === product.id ? (
                    <>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            handleEditChange("name", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            handleEditChange("price", e.target.value)
                          }
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.discount}
                          onChange={(e) =>
                            handleEditChange("discount", e.target.value)
                          }
                          step="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="datetime-local"
                          value={editForm.saleEnd}
                          onChange={(e) =>
                            handleEditChange("saleEnd", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveEdit(product.id)}
                        >
                          <Check />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.discount}%</TableCell>
                      <TableCell>
                        <CountdownTimer endTime={product.saleEnd} />
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(product)}
                        >
                          <Pencil />
                        </Button>
                        <Dialog
                          open={isDialogOpen && deleteId === product.id}
                          onOpenChange={setIsDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(product.id)}
                            >
                              <Trash2 />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete &quot;
                                {product.name}&quot;? This action cannot be
                                undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
