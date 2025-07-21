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

type HeaderMenuLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const adminLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { label: "Auction Page", href: "/auctions", icon: <DocumentMagnifyingGlassIcon className="h-5 w-5" /> },
  { label: "Request Auction", href: "/admin/requests", icon: <DocumentPlusIcon className="h-5 w-5" /> },
  { label: "Revenue", href: "/admin/revenue", icon: <ChartBarIcon className="h-5 w-5" /> },
  { label: "User Profile", href: "/admin/profile", icon: <UserIcon className="h-5 w-5" /> },
];

const customerLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { label: "Auctions", href: "/auctions", icon: <DocumentMagnifyingGlassIcon className="h-5 w-5" /> },
  { label: "Create Auction", href: "/customer/create-auction", icon: <DocumentPlusIcon className="h-5 w-5" /> },
  { label: "My Assets", href: "/customer/my-assets", icon: <CircleStackIcon className="h-5 w-5" /> },
  { label: "User Profile", href: "/customer/profile", icon: <UserIcon className="h-5 w-5" /> },
];

const roleConfig = {
  admin: { icon: ShieldCheckIcon, label: "Admin", links: adminLinks },
  customer: { icon: UserIcon, label: "Customer", links: customerLinks },
};

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

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto ">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" passHref className="flex items-center gap-2 ml-4 mr-6 shrink-0">
            <div className="flex items-center space-x-2">
              <Gavel className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">AuctionHub</span>
            </div>
          </Link>
          <NavigationMenu className="hidden md:flex flex-1 justify-center">
            <NavigationMenuList>
              <HeaderMenuLinks currentPathname={pathname} />
            </NavigationMenuList>
          </NavigationMenu>
          <div className="hidden md:flex items-center space-x-4">
            <RoleSwitcher />
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}
          </div>

          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Bars3Icon className="h-6 w-6" />
                <span className="sr-only">Buka Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => setIsDrawerOpen(false)}>
                    <div className="flex items-center space-x-2">
                      <Gavel className="h-8 w-8 text-primary" />
                      <span className="text-xl font-bold">AuctionHub</span>
                    </div>
                  </Link>
                </SheetTitle>
              </SheetHeader>

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
