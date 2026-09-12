import { createFileRoute } from '@tanstack/react-router'
import { useGoogleLogin } from '@/hooks/login/google';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { GoogleLoginButton } from '@/components/google/googleLogin';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { login, loading } = useGoogleLogin()

  return (
    <Card className="mx-auto min-w-sm w-2/3">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Sign in to continue to SCENE-feed
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        <GoogleLoginButton onClick={login} disabled={loading} />
      </CardContent>
    </Card>
  )
}
