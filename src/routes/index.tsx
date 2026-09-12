import { useArchiveItems } from '@/api/queries/archiveItems';
import { ArchiveListItem } from '@/components/archive/archiveListItem';
import { DateNavCard } from '@/components/archive/dateCard';
import { Loading } from '@/components/handlers/loading';
import { getTodayRange } from '@/utils/date';
import { createFileRoute } from '@tanstack/react-router'
import { addDays } from 'date-fns';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { start } = getTodayRange();
  const [date, setDate] = useState(start);
  const items = useArchiveItems(date, addDays(date, 1));

  return (
    <main className="flex flex-col gap-4">
      <DateNavCard date={date} onDateChange={(date) => {
        setDate(date);
      }} count={items.data?.length || 0} />

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
    </main>
  );
}
