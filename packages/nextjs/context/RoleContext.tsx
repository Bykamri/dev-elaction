"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

/**
 * RoleContext - User Role Management Context
 *
 * A React Context implementation for managing user roles throughout the application.
 * Provides role-based access control and navigation functionality with persistent
 * storage using localStorage. Supports switching between admin and customer roles
 * with automatic persistence across browser sessions.
 *
 * Key Features:
 * - Role-based access control with admin and customer roles
 * - Persistent role storage using localStorage
 * - Context-based state management for global role access
 * - Type-safe role definitions and context typing
 * - Automatic role restoration on application load
 * - Client-side only implementation with SSR safety
 *
 * Role Types:
 * - Admin: Full platform access with management capabilities
 * - Customer: Standard user access with auction participation
 *
 * Usage:
 * ```tsx
 * // Wrap your app with RoleProvider
 * <RoleProvider>
 *   <App />
 * </RoleProvider>
 *
 * // Use the hook in components
 * const { role, setRole } = useRole();
 * ```
 *
 * Storage:
 * - Role preferences persist in localStorage under "appRole" key
 * - Automatic fallback to "customer" role for new users
 * - SSR-safe implementation with client-side hydration
 *
 * @component
 * @category Context
 * @subcategory Authentication
 */

/**
 * Union type defining available user roles in the application
 *
 * - admin: Administrative access with full platform management
 * - customer: Standard user access with auction participation rights
 */
type Role = "admin" | "customer";

/**
 * Type definition for the Role Context value
 *
 * Defines the structure of the context value provided to consuming components,
 * including the current role state and role changing functionality.
 */
type RoleContextType = {
  /** Current active user role */
  role: Role;
  /** Function to update the current user role */
  setRole: (role: Role) => void;
};

/**
 * React Context for role management
 *
 * Creates the context instance that will hold role state and provide
 * it to child components throughout the application tree.
 */
const RoleContext = createContext<RoleContextType | undefined>(undefined);

/**
 * RoleProvider - Context Provider Component
 *
 * Provides role state management to the entire application tree. Handles
 * role persistence with localStorage and manages role state initialization
 * with SSR safety considerations. Automatically restores saved roles on
 * application load and provides role switching functionality.
 *
 * Features:
 * - Automatic role restoration from localStorage on mount
 * - Fallback to "customer" role for new users
 * - SSR-safe implementation with client-side checks
 * - Automatic persistence of role changes
 * - Type-safe role validation
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to provide context to
 * @returns {JSX.Element} Context provider wrapping children
 */
export const RoleProvider = ({ children }: { children: ReactNode }) => {
  // Initialize role state with localStorage restoration and fallback
  const [role, setRole] = useState<Role>(() => {
    // Client-side only localStorage access for SSR safety
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("appRole");
      // Validate saved role and ensure type safety
      if (savedRole && (savedRole === "admin" || savedRole === "customer")) {
        return savedRole;
      }
    }
    // Default fallback role for new users
    return "customer";
  });

  /**
   * Effect to persist role changes to localStorage
   *
   * Automatically saves role changes to localStorage whenever the role
   * state updates, ensuring persistence across browser sessions.
   */
  useEffect(() => {
    localStorage.setItem("appRole", role);
  }, [role]);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
};

/**
 * useRole - Role Context Consumer Hook
 *
 * A custom React hook that provides access to the role context throughout
 * the application. Ensures type safety and proper context usage with
 * automatic error handling for components used outside the provider.
 *
 * Features:
 * - Type-safe access to role state and setter
 * - Automatic validation of context availability
 * - Clear error messaging for improper usage
 * - Direct access to current role and role switching function
 *
 * Usage Examples:
 * ```tsx
 * // Get current role
 * const { role } = useRole();
 * if (role === 'admin') {
 *   // Show admin features
 * }
 *
 * // Switch roles
 * const { setRole } = useRole();
 * setRole('admin');
 * ```
 *
 * @returns {RoleContextType} Object containing current role and setRole function
 * @throws {Error} When used outside of RoleProvider
 */
export const useRole = () => {
  const context = useContext(RoleContext);

  // Ensure hook is used within proper provider context
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }

  return context;
};
