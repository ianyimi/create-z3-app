import { admin } from "better-auth/plugins"
import { apiKey } from "@better-auth/api-key"
import { convex } from "@convex-dev/better-auth/plugins"
import authConfig from "@convex/auth.config"
import { USER_ROLES } from "~/db/constants"

const plugins = [
  admin({
    adminRoles: [USER_ROLES.admin],
    defaultRole: USER_ROLES.user
  }),
  apiKey(),
  convex({ authConfig }),
]

export default plugins
