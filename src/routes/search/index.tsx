import { useSearchArchive } from '@/api/queries/search';
import { createFileRoute } from '@tanstack/react-router'
import { ArchiveListItem } from '@/components/archive/archiveListItem';
import { Loading } from '@/components/handlers/loading';
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
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Search results for "{q}"</h1>
      {items.isLoading ? (
        <Loading />
      ) : items.isError ? (
        <p>Error loading archive items.</p>
      ) : items.data?.length === 0 ? (
        <p>No archive items today.</p>
      ) : (items.data?.map((item) => (
            <ArchiveListItem
              key={item.id}
              item={item}
            />
          ))
      )}
    </div>
  );
}
