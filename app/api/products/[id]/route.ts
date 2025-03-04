import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { Product } from "@/lib/types";
import { db } from "@/lib/db";

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

  const updates: Partial<Product> = await req.json();

  // Validate updates
  if (updates.price !== undefined && typeof updates.price !== "number") {
    return NextResponse.json(
      { error: "Price must be a number" },
      { status: 400 }
    );
  }
  if (updates.discount !== undefined && typeof updates.discount !== "number") {
    return NextResponse.json(
      { error: "Discount must be a number" },
      { status: 400 }
    );
  }

  // Additional validation for discount (0-100)
  if (
    updates.discount !== undefined &&
    (updates.discount < 0 || updates.discount > 100)
  ) {
    return NextResponse.json(
      { error: "Discount must be between 0 and 100" },
      { status: 400 }
    );
  }

  try {
    // Update product in Vercel Postgres
    const result = await db.query(
      `UPDATE products SET name = $1, price = $2, discount = $3, "saleEnd" = $4 WHERE id = $5 RETURNING *`,
      [
        updates.name || null,
        updates.price || null,
        updates.discount || null,
        updates.saleEnd || null,
        id,
      ]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = result.rows[0];
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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
  try {
    const result = await db.query("DELETE FROM products WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
