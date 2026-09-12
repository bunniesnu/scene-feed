import { Button } from "@/components/ui/button"
import type { ReactNode } from "react";

export function BottomFloatingButton({ children }: { children: ReactNode }) {
  return (
    <Button
      size="lg"
      className="fixed bottom-6 left-1/2 z-50 h-14 -translate-x-1/2 rounded-full px-8 text-base shadow-lg"
    >
      {children}
    </Button>
  )
}