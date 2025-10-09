import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const client = createStorefrontApiClient({
  storeDomain: "jcse0m-cc.myshopify.com",
  apiVersion: '2025-01',
  publicAccessToken: "8454116ef34dbe31d051a7aad14b9bd7",
});

export default client;