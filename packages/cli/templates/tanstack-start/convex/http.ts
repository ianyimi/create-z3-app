import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { createAuth } from "./auth"

const http = httpRouter()

/**
 * Auth handler - handles Better Auth requests with custom adapter
 */
const authRequestHandler = httpAction(async (ctx, request) => {
  // Suppress the oidc-provider deprecation warning spammed by @convex-dev/better-auth
  // on every request. Convex wraps console.warn per-invocation, so this must run
  // inside the handler (not at module level) to intercept after Convex's wrapper is set.
  // Remove once @convex-dev/better-auth migrates to @better-auth/oauth-provider.
  const _warn = console.warn
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("oidc-provider")) return
    _warn(...args)
  }
  try {
    const auth = createAuth(ctx)
    const response = await auth.handler(request)
    return response
  } catch (error) {
    console.error("❌ Auth error:", error)
    return new Response("Auth error", { status: 500 })
  } finally {
    console.warn = _warn
  }
})

// Register auth routes with pathPrefix (matches all paths under /api/auth/)
http.route({
  pathPrefix: "/api/auth/",
  method: "GET",
  handler: authRequestHandler,
})

http.route({
  pathPrefix: "/api/auth/",
  method: "POST",
  handler: authRequestHandler,
})

// Optional: OpenID well-known configuration redirect
http.route({
  path: "/.well-known/openid-configuration",
  method: "GET",
  handler: httpAction(async () => {
    const url = `${process.env.SITE_URL}/api/auth/convex/.well-known/openid-configuration`
    return Response.redirect(url)
  }),
})

export default http
