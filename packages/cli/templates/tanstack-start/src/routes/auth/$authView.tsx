import { AuthView } from '@daveyplate/better-auth-ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/$authView')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const { authView } = Route.useParams()

  return (
    <main className="mx-auto flex h-[100svh] grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView pathname={authView} />
    </main>
  )
}
