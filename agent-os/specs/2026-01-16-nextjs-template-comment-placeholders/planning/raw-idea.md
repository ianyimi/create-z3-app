# Raw Idea

Add comment replacement strings to the Next.js template to match the TanStack template's installer capabilities. This involves reviewing all changes made by the TanStack installer and adding corresponding comment placeholders in the Next.js template files at appropriate locations. These placeholders will enable the Next.js framework installer (to be implemented in a future spec) to make the same types of modifications that the TanStack installer currently supports.

## Key Context

- The Next.js base template has been copied over
- Need to analyze TanStack installer to understand all file modifications it makes
- Comment strings need to be placed in slightly different locations due to framework differences
- This is preparation work for the Next.js installer implementation
