import { useSearchArchive } from '@/api/queries/search';
import { createFileRoute } from '@tanstack/react-router'
import { z } from "zod"

const searchSchema = z.object({
  q: z.string().optional().default(""),
})

export const Route = createFileRoute('/search/')({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
})

function RouteComponent() {
  const { q } = Route.useSearch();
  const items = useSearchArchive(q);
  return <div>Hello "/search/"!</div>
}
