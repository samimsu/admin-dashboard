// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Product } from "@/lib/types";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.query(
      `SELECT * FROM products ORDER BY "createdAt" DESC`,
      []
    );
    const products: Product[] = result.rows;

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const user = token ? await verifyToken(token) : null;

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

  if (typeof productData.price !== "number") {
    return NextResponse.json(
      { error: "Price must be a number" },
      { status: 400 }
    );
  }
  const discount =
    typeof productData.discount === "number" ? productData.discount : 0;
  if (discount < 0 || discount > 100) {
    return NextResponse.json(
      { error: "Discount must be between 0 and 100" },
      { status: 400 }
    );
  }

  try {
    const newProduct: Product = {
      id: uuidv4(),
      name: productData.name,
      price: productData.price,
      discount: discount,
      saleEnd: productData.saleEnd,
      createdAt: new Date().toISOString(),
    };

    const result = await db.query(
      `INSERT INTO products (id, name, price, discount, "saleEnd", "createdAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        newProduct.id,
        newProduct.name,
        newProduct.price,
        newProduct.discount,
        newProduct.saleEnd,
        newProduct.createdAt,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
