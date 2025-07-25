/**
 * @fileoverview 404 Not Found Page Component
 *
 * This page is automatically displayed by Next.js when a user navigates to a route
 * that doesn't exist in the application. It provides a user-friendly error message
 * and navigation back to the home page, improving the overall user experience
 * when encountering broken or mistyped URLs.
 *
 * @author Dev Team
 * @version 1.0.0
 */
import Link from "next/link";
import { Frown } from "lucide-react";

/**
 * NotFound Component
 *
 * A custom 404 error page that displays when users access non-existent routes.
 * The component provides a visually appealing error message with a clear call-to-action
 * to return to the home page. It follows accessibility best practices and maintains
 * consistent styling with the rest of the application.
 *
 * Features:
 * - Large, recognizable 404 error display
 * - Friendly frown icon for visual appeal
 * - Clear error message explaining the situation
 * - Direct navigation link back to home page
 * - Responsive design for all device sizes
 * - Consistent theming with application colors
 *
 * @component
 * @returns {JSX.Element} The rendered 404 not found page
 */
export default function NotFound() {
  return (
    // Main container with centered flex layout for vertical and horizontal centering
    <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
      {/* Frown icon from Lucide React - provides visual context for the error */}
      <Frown className="h-24 w-24 text-primary mb-6" />

      {/* Large 404 error code display - immediately recognizable to users */}
      <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>

      {/* Secondary heading explaining the error type */}
      <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>

      {/* Detailed explanation of the error in user-friendly language */}
      <p className="text-muted-foreground max-w-md mb-8">
        Sorry, we couldn&apos;t find the page you were looking for. You may have mistyped the URL, or the page has
        moved.
      </p>

      {/* Navigation link back to home page using Next.js Link component */}
      <Link href="/">
        {/* Call-to-action button with hover effects and consistent styling */}
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md text-lg font-medium transition-colors">
          Go Home
        </button>
      </Link>
    </main>
  );
}
