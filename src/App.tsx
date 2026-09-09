import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Page } from '@/pages/home.tsx'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  )
}

export default App;