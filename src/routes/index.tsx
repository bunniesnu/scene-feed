import { useArchiveItems } from '@/api/queries/archiveItems';
import { BottomFloatingButton } from '@/components/archive/addButton';
import { ArchiveListItem } from '@/components/archive/archiveListItem';
import { CreateArchiveItemDialog } from '@/components/archive/createArchivePopup';
import { DateNavCard } from '@/components/archive/dateCard';
import { Loading } from '@/components/handlers/loading';
import { useAdmin } from '@/hooks/auth/admin';
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
  const { isAdmin } = useAdmin();

  return (
    <div className="flex flex-col gap-4">
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

      { isAdmin && <CreateArchiveItemDialog>
        <BottomFloatingButton>
          Add archive
        </BottomFloatingButton>
      </CreateArchiveItemDialog> }
    </div>
  );
}
