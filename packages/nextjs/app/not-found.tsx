import Link from "next/link";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
      <Frown className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Sorry, we couldn&apos;t find the page you were looking for. You may have mistyped the URL, or the page has
        moved.
      </p>
      <Link href="/">
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md text-lg font-medium transition-colors">
          Go Home
        </button>
      </Link>
    </main>
  );
}
