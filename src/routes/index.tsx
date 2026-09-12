import { useArchiveItems } from '@/api/queries/archiveItems';
import { ArchiveListItem } from '@/components/archive/archiveListItem';
import { getTodayRange } from '@/utils/date';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { start, end } = getTodayRange();
  const items = useArchiveItems(start, end)

  if (items.isLoading) {
    return <div>Loading...</div>;
  }

  if (items.isError) {
    return <div>Error</div>;
  }

  return (
    <main>
      <h1>Today's Archive</h1>

      {items.data?.length === 0 ? (
        <p>No archive items today.</p>
      ) : (items.data?.map((item) => (
            <ArchiveListItem
              key={item.id}
              item={{
                id: item.id,
                title: item.title,
                publishedAt: new Date(item.published_at).toLocaleString(),
              }}
            />
          ))
      )}
    </main>
  );
}
