import { DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

export function CloseButton() {
  return (
    <DialogClose className="h-8 w-8 flex items-center justify-center rounded-lg opacity-70 hover:opacity-100 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogClose>
  )
}