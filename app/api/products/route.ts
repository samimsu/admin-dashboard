import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { addProduct, getProducts } from "@/lib/db";
import { Product } from "@/lib/types";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = getProducts();
  return NextResponse.json(products, { status: 200 });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productData: Omit<Product, "id" | "createdAt"> = await req.json();
  if (!productData.name || !productData.price) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const newProduct: Product = {
    id: Date.now().toString(), // Still simple; could use UUID
    name: productData.name,
    price: Number(productData.price),
    discount: Number(productData.discount || 0),
    saleEnd: productData.saleEnd,
    createdAt: new Date().toISOString(),
  };

  addProduct(newProduct);

  return NextResponse.json(newProduct, { status: 201 });
}
