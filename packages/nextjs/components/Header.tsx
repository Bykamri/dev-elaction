"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, ChevronDownIcon, Gavel, HomeIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { hardhat } from "viem/chains";
import { Bars3Icon, CircleStackIcon, DocumentMagnifyingGlassIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "~~/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~~/components/ui/sheet";
import { useRole } from "~~/context/RoleContext";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Header Component
 *
 * The main navigation header for the Elaction platform, providing role-based
 * navigation, wallet connection, and responsive mobile menu functionality.
 * Features a sticky design with backdrop blur effects and dynamic content
 * based on user roles (admin/customer) with role switching capabilities.
 *
 * Key Features:
 * - Role-based navigation with different menu items for admin and customer roles
 * - Responsive design with mobile sheet menu and desktop navigation
 * - Wallet connection integration with RainbowKit
 * - Local network detection with faucet button display
 * - Brand identity with logo and platform name
 * - Active navigation state highlighting
 * - Role switcher dropdown for easy role transitions
 * - Backdrop blur effects with sticky positioning
 *
 * Role Configurations:
 * - Admin: Home, Auction Page, Request Auction, Revenue, User Profile
 * - Customer: Home, Auctions, Create Auction, My Assets, User Profile
 *
 * Navigation Features:
 * - Active page highlighting with primary colors
 * - Hover effects with accent color transitions
 * - Icon integration for visual navigation cues
 * - Responsive menu collapsing on mobile devices
 *
 * Wallet Integration:
 * - RainbowKit custom connect button
 * - Local network faucet button (development)
 * - Network detection and conditional display
 *
 * @component
 * @category Layout
 * @subcategory Navigation
 */

/**
 * Type definition for header menu link items
 *
 * Defines the structure of navigation menu items including
 * display label, navigation URL, and associated icon component.
 */
type HeaderMenuLink = {
  /** Display text for the navigation link */
  label: string;
  /** Navigation URL path */
  href: string;
  /** Icon component to display alongside the link */
  icon: React.ReactNode;
};

/**
 * Navigation links configuration for admin role
 *
 * Provides admin-specific navigation options including:
 * - Home dashboard access
 * - Auction page management
 * - Request auction handling
 * - Revenue analytics
 * - User profile management
 */
const adminLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { label: "Auction Page", href: "/auctions", icon: <DocumentMagnifyingGlassIcon className="h-5 w-5" /> },
  { label: "Request Auction", href: "/admin/requests", icon: <DocumentPlusIcon className="h-5 w-5" /> },
  { label: "Revenue", href: "/admin/revenue", icon: <ChartBarIcon className="h-5 w-5" /> },
  { label: "User Profile", href: "/admin/profile", icon: <UserIcon className="h-5 w-5" /> },
];

/**
 * Navigation links configuration for customer role
 *
 * Provides customer-specific navigation options including:
 * - Home page access
 * - Auction browsing
 * - Auction creation
 * - Asset management
 * - Profile management
 */
const customerLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { label: "Auctions", href: "/auctions", icon: <DocumentMagnifyingGlassIcon className="h-5 w-5" /> },
  { label: "Create Auction", href: "/customer/create-auction", icon: <DocumentPlusIcon className="h-5 w-5" /> },
  { label: "My Assets", href: "/customer/my-assets", icon: <CircleStackIcon className="h-5 w-5" /> },
  { label: "User Profile", href: "/customer/profile", icon: <UserIcon className="h-5 w-5" /> },
];

/**
 * Role configuration object mapping roles to their navigation settings
 *
 * Defines the complete role-based navigation structure including:
 * - Icon components for visual role identification
 * - Display labels for user interface
 * - Navigation link arrays for each role type
 */
const roleConfig = {
  admin: { icon: ShieldCheckIcon, label: "Admin", links: adminLinks },
  customer: { icon: UserIcon, label: "Customer", links: customerLinks },
};

/**
 * RoleSwitcher - Role Toggle Dropdown Component
 *
 * Provides a dropdown interface for users to switch between admin and customer
 * roles. Features role icons, labels, and smooth transitions between different
 * navigation contexts.
 *
 * @returns {JSX.Element} Dropdown menu component for role switching
 */
const RoleSwitcher = () => {
  const { role, setRole } = useRole();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          {React.createElement(roleConfig[role].icon, { className: "h-5 w-5" })}
          <span className="hidden sm:inline ml-2">{roleConfig[role].label}</span>
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setRole("admin")}>
          <ShieldCheckIcon className="mr-2 h-4 w-4" />
          <span>Admin</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole("customer")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Customer</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * HeaderMenuLinks - Dynamic Navigation Links Component
 *
 * Renders navigation menu items based on the current user role. Provides
 * active state highlighting and responsive navigation behavior. Automatically
 * adapts to show role-specific navigation options.
 *
 * @param {Object} props - Component props
 * @param {string} props.currentPathname - Current page pathname for active state
 * @returns {JSX.Element} Navigation menu items with active state handling
 */
const HeaderMenuLinks = ({ currentPathname }: { currentPathname: string }) => {
  const { role } = useRole();
  const menuLinks = roleConfig[role].links;

  return (
    <>
      {menuLinks.map(({ label, href }) => {
        const isActive = currentPathname === href;
        return (
          <NavigationMenuItem key={href}>
            <Link href={href} legacyBehavior passHref>
              <NavigationMenuLink
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                active={isActive}
              >
                {label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        );
      })}
    </>
  );
};

/**
 * Header - Main Application Header Component
 *
 * The primary navigation header providing comprehensive platform navigation,
 * role-based menu systems, wallet integration, and responsive mobile support.
 * Features sticky positioning with backdrop blur effects for modern design.
 *
 * Key Functionality:
 * - Role-based navigation with dynamic menu generation
 * - Responsive design with mobile sheet drawer
 * - Wallet connection with RainbowKit integration
 * - Local network detection and faucet access
 * - Brand identity with logo and platform branding
 * - Active page highlighting and hover effects
 *
 * @returns {JSX.Element} Complete header component with navigation and utilities
 */
export const Header = () => {
  // Mobile drawer state management
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Navigation and network detection hooks
  const pathname = usePathname();
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto ">
        <div className="flex h-16 items-center justify-between">
          {/* Brand logo and platform name */}
          <Link href="/" passHref className="flex items-center gap-2 ml-4 mr-6 shrink-0">
            <div className="flex items-center space-x-2">
              <Gavel className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Elaction</span>
            </div>
          </Link>

          {/* Desktop navigation menu */}
          <NavigationMenu className="hidden md:flex flex-1 justify-center">
            <NavigationMenuList>
              <HeaderMenuLinks currentPathname={pathname} />
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop action buttons (role switcher, wallet, faucet) */}
          <div className="hidden md:flex items-center space-x-4">
            <RoleSwitcher />
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}
          </div>

          {/* Mobile navigation sheet */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Bars3Icon className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  {/* Mobile menu logo and brand */}
                  <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => setIsDrawerOpen(false)}>
                    <div className="flex items-center space-x-2">
                      <Gavel className="h-8 w-8 text-primary" />
                      <span className="text-xl font-bold"> Elaction</span>
                    </div>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile navigation links */}
              <nav className="grid gap-2">
                {roleConfig[useRole().role].links.map(({ label, href, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      pathname === href ? "bg-muted text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {icon}
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Mobile action buttons section */}
              <div className="md:hidden flex flex-col space-y-3 pt-4 border-t">
                <RoleSwitcher />
                <RainbowKitCustomConnectButton />
                {isLocalNetwork && <FaucetButton />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
