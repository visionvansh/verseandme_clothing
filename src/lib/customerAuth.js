// /src/lib/customerAuth.js
import { storefrontQuery } from './shopify';

// Login mutation
const LOGIN_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Customer query with orders
const CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      acceptsMarketing
      createdAt
      orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPriceV2 {
              amount
              currencyCode
            }
            subtotalPriceV2 {
              amount
              currencyCode
            }
            totalShippingPriceV2 {
              amount
              currencyCode
            }
            totalTaxV2 {
              amount
              currencyCode
            }
            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    image {
                      url
                      altText
                    }
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            shippingAddress {
              firstName
              lastName
              address1
              address2
              city
              province
              country
              zip
            }
            statusUrl
          }
        }
      }
    }
  }
`;

// Logout mutation
const LOGOUT_MUTATION = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

// Renew token mutation
const RENEW_TOKEN_MUTATION = `
  mutation customerAccessTokenRenew($customerAccessToken: String!) {
    customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Create customer account mutation
const CREATE_CUSTOMER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Recover password mutation
const RECOVER_PASSWORD_MUTATION = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerAuth = {
  // Login customer
  login: async (email, password) => {
    try {
      const result = await storefrontQuery(LOGIN_MUTATION, {
        input: { email, password }
      });

      if (result.data.customerAccessTokenCreate.customerUserErrors.length > 0) {
        throw new Error(
          result.data.customerAccessTokenCreate.customerUserErrors[0].message
        );
      }

      const { accessToken, expiresAt } = 
        result.data.customerAccessTokenCreate.customerAccessToken;

      // Store token in localStorage
      localStorage.setItem('customerAccessToken', accessToken);
      localStorage.setItem('tokenExpiresAt', expiresAt);

      return { accessToken, expiresAt };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get customer data with orders
  getCustomer: async (accessToken) => {
    try {
      const result = await storefrontQuery(CUSTOMER_QUERY, {
        customerAccessToken: accessToken
      });

      if (!result.data.customer) {
        throw new Error('Customer not found or token expired');
      }

      return result.data.customer;
    } catch (error) {
      console.error('Get customer error:', error);
      throw error;
    }
  },

  // Logout customer
  logout: async (accessToken) => {
    try {
      await storefrontQuery(LOGOUT_MUTATION, {
        customerAccessToken: accessToken
      });

      // Clear localStorage
      localStorage.removeItem('customerAccessToken');
      localStorage.removeItem('tokenExpiresAt');

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Renew access token
  renewToken: async (accessToken) => {
    try {
      const result = await storefrontQuery(RENEW_TOKEN_MUTATION, {
        customerAccessToken: accessToken
      });

      if (result.data.customerAccessTokenRenew.userErrors.length > 0) {
        throw new Error(
          result.data.customerAccessTokenRenew.userErrors[0].message
        );
      }

      const { accessToken: newToken, expiresAt } = 
        result.data.customerAccessTokenRenew.customerAccessToken;

      localStorage.setItem('customerAccessToken', newToken);
      localStorage.setItem('tokenExpiresAt', expiresAt);

      return { accessToken: newToken, expiresAt };
    } catch (error) {
      console.error('Renew token error:', error);
      throw error;
    }
  },

  // Check if token is expired
  isTokenExpired: () => {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) return true;
    return new Date(expiresAt) <= new Date();
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('customerAccessToken');
  },

  // Create new customer account
  createAccount: async (email, password, firstName, lastName) => {
    try {
      const result = await storefrontQuery(CREATE_CUSTOMER_MUTATION, {
        input: {
          email,
          password,
          firstName,
          lastName,
          acceptsMarketing: false
        }
      });

      if (result.data.customerCreate.customerUserErrors.length > 0) {
        throw new Error(
          result.data.customerCreate.customerUserErrors[0].message
        );
      }

      return result.data.customerCreate.customer;
    } catch (error) {
      console.error('Create account error:', error);
      throw error;
    }
  },

  // Recover password
  recoverPassword: async (email) => {
    try {
      const result = await storefrontQuery(RECOVER_PASSWORD_MUTATION, {
        email
      });

      if (result.data.customerRecover.customerUserErrors.length > 0) {
        throw new Error(
          result.data.customerRecover.customerUserErrors[0].message
        );
      }

      return true;
    } catch (error) {
      console.error('Recover password error:', error);
      throw error;
    }
  }
};