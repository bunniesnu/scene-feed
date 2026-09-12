import { Outlet, createRootRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-dvh flex flex-col items-center">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-3xl flex h-14 items-center justify-between px-4 mx-auto">
          <Link to="/" className="font-bold text-lg">
            SCENE-feed
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/login">
              <Button variant="outline" size="lg" className="rounded-full cursor-pointer px-4">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
