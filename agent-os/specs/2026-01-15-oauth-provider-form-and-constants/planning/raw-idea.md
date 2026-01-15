# Raw Idea: OAuth Provider Form and Constants

## User's Description

"now what needs to be done to udpate the form to collect all required information to build the cli input experience form? here is a file from the better auth url that has all of the providers. I want to maintain a constant object somewhere that will hold all src code that will be used in the string replacements for each part of installation process. https://github.com/better-auth/better-auth/blob/2b9cd6d696a515fc696155409f7a6959ce136384/packages/core/src/social-providers/index.ts#L86. for example, the object may be called OAUTH_PROVIDERS and will look something like this from another project I have: export const jsonSchema = {
    dark: {
        type: "object",
        properties: themeJsonSchema,
        required: true,
    },
    light: {
        type: "object",
        properties: themeJsonSchema,
        required: true,
    },
} as const;
each field (light, dark in this example, will be replaced with a provider, and inside this object the provider will have the source code that is the replacement text to be added for each file that needs replacement for the oauth provider) an example object would be { betterAuthConfig: { import: string, socialProvider: string }, env: { name: string, type: 'server' | 'client' }[], ...} there may be more I am forgetting right now but this is the idea. this constant object will be used in each of the functions to replace the necessary files in each frameworkinstaller in the correct files. here is the url for the better auth socialProvider docs for the apple social provider, this url along with the one listing all the frameworks should provide enough info to find the links and source code for all the providers, and copy them into the const object immediately. lets work out the full extent of the const object in the spec before starting the implementation"

## Key Points

- Update CLI form to collect OAuth provider information
- Create OAUTH_PROVIDERS constant object with source code for each provider
- Structure: `{ betterAuthConfig: { import: string, socialProvider: string }, env: { name: string, type: 'server' | 'client' }[], ...}`
- Source providers from Better Auth documentation
- This constant will be used by FrameworkInstaller classes for file replacements

## Reference Links

- Better Auth Providers List: https://github.com/better-auth/better-auth/blob/2b9cd6d696a515fc696155409f7a6959ce136384/packages/core/src/social-providers/index.ts#L86
- Better Auth Apple Social Provider Documentation (example)

## Initial Structure Concept

```typescript
export const OAUTH_PROVIDERS = {
    [providerName]: {
        betterAuthConfig: {
            import: string,
            socialProvider: string
        },
        env: {
            name: string,
            type: 'server' | 'client'
        }[],
        // Additional properties to be determined during spec phase
    }
} as const;
```

## Goal

Work out the full extent of the constant object structure in the spec before starting implementation.
