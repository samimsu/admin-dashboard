import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { updateProduct, deleteProduct, getProducts } from "@/lib/db";
import { Product } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const products = getProducts();
  const existingProduct = products.find((p) => p.id === id);
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updates: Partial<Product> = await req.json();
  if (updates.price && typeof updates.price !== "number") {
    return NextResponse.json(
      { error: "Price must be a number" },
      { status: 400 }
    );
  }
  if (updates.discount && typeof updates.discount !== "number") {
    return NextResponse.json(
      { error: "Discount must be a number" },
      { status: 400 }
    );
  }

  updateProduct(id, updates);
  const updatedProduct = { ...existingProduct, ...updates };
  return NextResponse.json(updatedProduct, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const products = getProducts();
  if (!products.find((p) => p.id === id)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  deleteProduct(id);
  return NextResponse.json(
    { message: "Product deleted successfully" },
    { status: 200 }
  );
}
