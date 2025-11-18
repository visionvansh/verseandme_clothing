// src/lib/checkout.ts
interface LineItem {
  variantId: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export async function createCheckout(
  lineItems: LineItem[],
  email: string,
  shippingAddress: ShippingAddress
): Promise<string> {
  const shopifyConfig = {
    storeDomain: "v2ipik-4h.myshopify.com",
    apiVersion: "2025-01",
    publicAccessToken: "583dc774f77238f6dfe6dc902ffd033c",
  };

  // Use cartCreate instead of checkoutCreate
  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      buyerIdentity: {
        email: email,
        deliveryAddressPreferences: [
          {
            deliveryAddress: {
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              address1: shippingAddress.address1,
              address2: shippingAddress.address2 || "",
              city: shippingAddress.city,
              province: shippingAddress.province,
              country: shippingAddress.country,
              zip: shippingAddress.zip,
              phone: shippingAddress.phone || "",
            }
          }
        ]
      },
      lines: lineItems.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      })),
    },
  };

  try {
    const response = await fetch(
      `https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": shopifyConfig.publicAccessToken,
        },
        body: JSON.stringify({ query: mutation, variables }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      throw new Error(result.errors[0].message);
    }

    if (result.data.cartCreate.userErrors.length > 0) {
      const errors = result.data.cartCreate.userErrors;
      console.error("Cart User Errors:", errors);
      throw new Error(errors[0].message);
    }

    return result.data.cartCreate.cart.checkoutUrl;
  } catch (error) {
    console.error("Checkout creation error:", error);
    throw error;
  }
}