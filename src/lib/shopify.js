// /src/lib/shopify.js

const shopifyConfig = {
  storeDomain: "v2ipik-4h.myshopify.com",
  apiVersion: '2025-01',
  storefrontAccessToken: "583dc774f77238f6dfe6dc902ffd033c",
};

// Generic query function with optional variables
export async function storefrontQuery(query, variables = {}) {
  const url = `https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`;
  
  console.log("🌐 Fetching from URL:", url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", errorText);
      throw new Error(`Shopify API HTTP error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Response data:", data);
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error("❌ GraphQL Errors:", data.errors);
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
    }
    
    return data;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
}

// Keep the old client for backwards compatibility
const client = {
  request: async (query) => {
    const result = await storefrontQuery(query);
    return result;
  }
};

export default client;