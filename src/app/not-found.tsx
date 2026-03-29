import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Empty className="max-w-xl border border-dashed border-border bg-card/30">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>404 - Page Not Found</EmptyTitle>
          <EmptyDescription>
            The page you are looking for does not exist or is temporarily
            unavailable.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Back to Home
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
