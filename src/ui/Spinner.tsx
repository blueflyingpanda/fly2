import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-accent", className)} />;
}

export function FullScreenSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="h-8 w-8" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
