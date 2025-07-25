/**
 * Footer Component
 *
 * The main footer component for the Elaction platform, providing comprehensive
 * navigation links, platform information, and legal documentation access.
 * Features a professional dark theme with organized link sections and
 * brand identity elements including the platform logo and description.
 *
 * Key Features:
 * - Brand identity section with logo and platform description
 * - Organized navigation links grouped by category
 * - Platform links: Browse auctions, how it works, fees, security
 * - Support links: Help center, contact, community, bug reports
 * - Legal links: Terms, privacy policy, cookies, disclaimer
 * - Copyright notice with blockchain technology emphasis
 * - Responsive grid layout for different screen sizes
 * - Consistent hover effects and color scheme
 *
 * Layout Structure:
 * - 4-column grid on medium and larger screens
 * - Responsive collapse on smaller devices
 * - Clear visual hierarchy with proper spacing
 * - Accessible link styling with hover states
 *
 * Design Elements:
 * - Dark gray background (gray-900) for professional appearance
 * - Purple accent color for brand logo (purple-400)
 * - Subtle text colors with appropriate contrast ratios
 * - Consistent spacing and typography throughout
 *
 * @component
 * @category Layout
 * @subcategory Navigation
 */
import { Gavel } from "lucide-react";

/**
 * Footer - Main Application Footer Component
 *
 * Renders the global footer section with organized navigation links,
 * platform information, and legal documentation. Provides users with
 * easy access to all major platform sections and support resources.
 *
 * @returns {JSX.Element} Rendered footer component with navigation and info sections
 */
export const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-gray-900 text-white">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand identity and platform description section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Gavel className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold">Elaction</span>
            </div>
            <p className="text-gray-400">
              The world&apos;s first fully decentralized auction platform powered by blockchain technology.
            </p>
          </div>

          {/* Platform navigation links section */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Browse Auctions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Fees
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Support and community links section */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Bug Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Legal documentation links section */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and platform attribution section */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Elaction. All rights reserved. Built on Ethereum blockchain.</p>
        </div>
      </div>
    </footer>
  );
};
