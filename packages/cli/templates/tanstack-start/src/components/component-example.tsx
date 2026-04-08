import { Link } from '@tanstack/react-router'
import { TerminalIcon, UserIcon } from 'lucide-react'

import { signOut, useSession } from '~/lib/auth/client'
import { Button } from '~/components/ui/button'

export function ComponentExample() {
  const { data: session } = useSession()

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      {session?.user && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="bg-muted flex size-8 items-center justify-center rounded-full">
            <UserIcon className="text-muted-foreground size-4" />
          </div>
          <span className="text-sm font-medium">{session.user.name}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="bg-foreground text-background flex size-14 items-center justify-center rounded-2xl">
          <TerminalIcon className="size-7" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">create-z3-app</h1>
          <p className="text-muted-foreground max-w-sm text-base">
            A full-stack starter with TanStack Start, Convex, and Better Auth — ready to ship.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {session?.user ? (
          <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
        ) : (
          <>
            <Button asChild>
              <Link to="/auth/$authView" params={{ authView: 'sign-up' }}>Sign up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth/$authView" params={{ authView: 'sign-in' }}>Sign in</Link>
            </Button>
          </>
        )}
      </div>

      <code className="bg-muted text-muted-foreground rounded-lg px-4 py-2 text-sm font-mono">
        npm create z3-app@latest
      </code>
    </div>
  )
}
