import { admin, apiKey } from "better-auth/plugins"
import { convex } from "@convex-dev/better-auth/plugins"
import { USER_ROLES } from "~/db/constants"
import authConfig from "@convex/auth.config"

const plugins = [
  admin({
    adminRoles: [USER_ROLES.admin],
    defaultRole: USER_ROLES.user
  }),
  apiKey(),
  convex({ authConfig })
]

export default plugins
