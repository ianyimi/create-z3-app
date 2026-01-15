# Raw Idea

## User's Original Description

"I am looking to start building the cli now, I want to start the survey so that it takes which framework I want to use, giving two options for next and tanstack start. then I want to deploy the package to npm with the first version so I can test whether it works in my terminal by running npm create-z3-app my-app and having the survey run and ask me that question. nothing else should happen at this point"

## Additional Context

- This is for the create-z3-app CLI project
- We need to check if this changes any dependency requirements
- This is the first implementation of the interactive survey system
- Goal is to publish to npm and test the basic survey flow

## Key Requirements Identified

1. Build the CLI with an interactive survey
2. Survey should ask which framework to use
3. Framework options: Next.js and TanStack Start
4. Deploy package to npm (first version)
5. Test by running: `npm create-z3-app my-app`
6. At this stage, only the survey should run - no other functionality
