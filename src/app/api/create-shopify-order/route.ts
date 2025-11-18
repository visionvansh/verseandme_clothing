// /src/app/api/create-shopify-order/route.ts
import { NextResponse } from "next/server";

const SHOPIFY_ADMIN_API = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;

// Query to find customer by email
const FIND_CUSTOMER_QUERY = `
  query getCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

// Create draft order mutation
const CREATE_DRAFT_ORDER_MUTATION = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        order {
          id
          name
          orderNumber
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Complete draft order mutation
const COMPLETE_DRAFT_ORDER_MUTATION = `
  mutation draftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id) {
      draftOrder {
        id
        order {
          id
          name
          orderNumber
          customer {
            id
            email
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lineItems, customer, shippingAddress, totalPrice, paymentId } = body;

    console.log("📦 Creating Shopify order for:", customer.email);

    // Step 1: Find customer by email
    let customerId = null;
    
    try {
      const customerSearchResponse = await fetch(SHOPIFY_ADMIN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: FIND_CUSTOMER_QUERY,
          variables: {
            query: `email:${customer.email}`,
          },
        }),
      });

      const customerData = await customerSearchResponse.json();
      
      if (customerData.data?.customers?.edges?.length > 0) {
        customerId = customerData.data.customers.edges[0].node.id;
        console.log("✅ Found existing customer:", customerId);
      } else {
        console.log("ℹ️ No customer found with email:", customer.email);
      }
    } catch (error) {
      console.error("⚠️ Error finding customer:", error);
      // Continue without customer ID
    }

    // Step 2: Prepare line items with proper variant IDs
    const formattedLineItems = lineItems.map((item: any) => {
      // Extract numeric ID from variant_id
      const numericId = item.variant_id.toString().replace(/\D/g, '');
      const variantGid = `gid://shopify/ProductVariant/${numericId}`;
      
      console.log(`📌 Line item: ${item.quantity}x variant ${variantGid}`);
      
      return {
        variantId: variantGid,
        quantity: parseInt(item.quantity),
      };
    });

    // Step 3: Create draft order input
    const draftOrderInput: any = {
      lineItems: formattedLineItems,
      email: customer.email,
      shippingAddress: {
        firstName: shippingAddress.first_name,
        lastName: shippingAddress.last_name,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city,
        province: shippingAddress.province,
        country: shippingAddress.country,
        zip: shippingAddress.zip,
        phone: shippingAddress.phone || "",
      },
      billingAddress: {
        firstName: shippingAddress.first_name,
        lastName: shippingAddress.last_name,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city,
        province: shippingAddress.province,
        country: shippingAddress.country,
        zip: shippingAddress.zip,
      },
      note: `Payment ID: ${paymentId}
Processed via Stripe`,
      tags: ["stripe-checkout", "web-order", paymentId],
    };

    // Add customer ID if found
    if (customerId) {
      draftOrderInput.customerId = customerId;
      console.log("🔗 Linking order to customer:", customerId);
    }

    console.log("📝 Creating draft order with input:", JSON.stringify(draftOrderInput, null, 2));

    // Step 4: Create draft order
    const draftResponse = await fetch(SHOPIFY_ADMIN_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: CREATE_DRAFT_ORDER_MUTATION,
        variables: {
          input: draftOrderInput,
        },
      }),
    });

    const draftData = await draftResponse.json();

    if (draftData.errors || draftData.data?.draftOrderCreate?.userErrors?.length > 0) {
      console.error("❌ Draft order creation error:", JSON.stringify(draftData, null, 2));
      throw new Error(JSON.stringify(draftData.errors || draftData.data.draftOrderCreate.userErrors));
    }

    const draftOrderId = draftData.data.draftOrderCreate.draftOrder.id;
    console.log("✅ Draft order created:", draftOrderId);

    // Step 5: Complete draft order (converts to real order)
    const completeResponse = await fetch(SHOPIFY_ADMIN_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: COMPLETE_DRAFT_ORDER_MUTATION,
        variables: {
          id: draftOrderId,
        },
      }),
    });

    const completeData = await completeResponse.json();

    if (completeData.errors || completeData.data?.draftOrderComplete?.userErrors?.length > 0) {
      console.error("❌ Draft order completion error:", JSON.stringify(completeData, null, 2));
      throw new Error(JSON.stringify(completeData.errors || completeData.data.draftOrderComplete.userErrors));
    }

    const finalOrder = completeData.data.draftOrderComplete.draftOrder.order;
    console.log("✅ Order completed successfully:", finalOrder.name);
    console.log("✅ Order linked to customer:", finalOrder.customer?.email || "guest");

    return NextResponse.json({
      success: true,
      order: finalOrder,
      orderId: finalOrder.id,
      orderName: finalOrder.name,
      orderNumber: finalOrder.orderNumber,
      customerLinked: !!finalOrder.customer,
    });
  } catch (error: any) {
    console.error("❌ Create Shopify order error:", error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}