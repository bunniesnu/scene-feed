import { useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export function SearchPopup({ open, setOpen }: SearchProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    navigate({
      to: "/search",
      search: { q: query.trim() },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
      </DialogTrigger>

      <DialogContent className="top-12 translate-y-0 p-3 sm:max-w-lg [&>button]:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="pl-9"
            autoFocus
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}