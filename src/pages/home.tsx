import { useArchiveItems } from "@/api/queries/archiveItems";
import { getTodayRange } from "@/utils/date";

export function Page() {
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
      ) : (
        <ul>
          {items.data?.map((item) => (
            <li key={item.id}>
              <h2>{item.title}</h2>

              {item.description && <p>{item.description}</p>}

              {item.published_at && (
                <time>{new Date(item.published_at).toLocaleString()}</time>
              )}

              {item.source_url && (
                <a href={item.source_url} target="_blank" rel="noreferrer">
                  {item.source_name ?? "Source"}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}