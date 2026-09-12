import { Spinner } from "@/components/ui/spinner";

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 text-black/50">
      <Spinner />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}