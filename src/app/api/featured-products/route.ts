//Volumes/vision/codes/verse/my-app/src/app/api/featured-products/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.featuredProduct.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { shopifyProductId: true },
    });

    // Convert numeric IDs to Shopify GID format
    const productIds = products.map((p) => 
      `gid://shopify/Product/${p.shopifyProductId}`
    );

    return NextResponse.json({ productIds });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}