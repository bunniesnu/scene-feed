import { useArchiveItems } from '@/api/queries/archiveItems';
import { ArchiveListItem } from '@/components/archive/archiveListItem';
import { DateNavCard } from '@/components/archive/dateCard';
import { getTodayRange } from '@/utils/date';
import { createFileRoute } from '@tanstack/react-router'
import { addDays } from 'date-fns';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { start, end } = getTodayRange();
  const [date, setDate] = useState(start);
  const items = useArchiveItems(date, addDays(end, 1));

  if (items.isLoading) {
    return <div>Loading...</div>;
  }

  if (items.isError) {
    return <div>Error</div>;
  }

  return (
    <main className="flex flex-col gap-4">
      <DateNavCard date={date} onDateChange={(date) => {
        setDate(date);
      }} count={items.data?.length || 0} />

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
