//Volumes/vision/codes/verse/my-app/src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple authentication - replace with your actual auth
const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-secret-key";

function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${ADMIN_SECRET}`;
}

// GET - Fetch all featured products
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.featuredProduct.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST - Add a new featured product
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { shopifyProductId, displayOrder } = await request.json();

    if (!shopifyProductId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.featuredProduct.create({
      data: {
        shopifyProductId: shopifyProductId.toString(),
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Product already exists" }, { status: 409 });
    }
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// DELETE - Remove a featured product
export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.featuredProduct.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// PATCH - Update product status or order
export async function PATCH(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, isActive, displayOrder } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.featuredProduct.update({
      where: { id },
      data: {
        ...(typeof isActive === "boolean" && { isActive }),
        ...(typeof displayOrder === "number" && { displayOrder }),
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}