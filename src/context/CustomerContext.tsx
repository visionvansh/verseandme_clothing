// /src/context/CustomerContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { customerAuth } from "@/lib/customerAuth";

interface OrderLineItem {
  node: {
    title: string;
    quantity: number;
    variant: {
      id: string;
      title: string;
      image: {
        url: string;
        altText?: string;
      } | null;
      priceV2: {
        amount: string;
        currencyCode: string;
      };
    };
  };
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
}

interface Order {
  node: {
    id: string;
    name: string;
    orderNumber: number;
    processedAt: string;
    financialStatus: string;
    fulfillmentStatus: string | null;
    totalPriceV2: {
      amount: string;
      currencyCode: string;
    };
    subtotalPriceV2: {
      amount: string;
      currencyCode: string;
    };
    totalShippingPriceV2: {
      amount: string;
      currencyCode: string;
    };
    totalTaxV2: {
      amount: string;
      currencyCode: string;
    } | null;
    lineItems: {
      edges: OrderLineItem[];
    };
    shippingAddress: ShippingAddress | null;
    statusUrl: string;
  };
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing: boolean;
  createdAt: string;
  orders: {
    edges: Order[];
  };
}

interface CustomerContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  createAccount: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const token = customerAuth.getStoredToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Check if token is expired
    if (customerAuth.isTokenExpired()) {
      try {
        // Try to renew token
        await customerAuth.renewToken(token);
        await fetchCustomer();
      } catch (error) {
        console.error("Failed to renew token:", error);
        await logout();
      }
    } else {
      await fetchCustomer();
    }

    setIsLoading(false);
  };

  const fetchCustomer = async () => {
    try {
      const token = customerAuth.getStoredToken();
      if (!token) return;

      const customerData = await customerAuth.getCustomer(token);
      setCustomer(customerData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      await logout();
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await customerAuth.login(email, password);
      await fetchCustomer();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = customerAuth.getStoredToken();
    if (token) {
      try {
        await customerAuth.logout(token);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    setCustomer(null);
    setIsAuthenticated(false);
  };

  const refreshCustomer = async () => {
    await fetchCustomer();
  };

  const createAccount = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setIsLoading(true);
    try {
      await customerAuth.createAccount(email, password, firstName, lastName);
      // Auto-login after account creation
      await login(email, password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const recoverPassword = async (email: string) => {
    try {
      await customerAuth.recoverPassword(email);
    } catch (error) {
      throw error;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshCustomer,
        createAccount,
        recoverPassword,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}