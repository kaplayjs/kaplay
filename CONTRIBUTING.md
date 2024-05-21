## Developing Kaplay

1. `git clone https://github.com/marklovers/kaplay.git` to clone the repo.
1. `cd kaplay` to enter the project directory.
1. `pnpm install` to install dependencies.

## Editing examples
1. Pick on example to test and edit the corresponding `/examples/[name].js`, or create a new file under `/examples` to test anything you're working on.
1. The source entry point is `src/kaboom.ts`, editing any files referenced will automatically trigger rebuild. **Make sure not to break any existing examples**.

## Before commit
1. `npm run check` to check typescript.
1. `npm run fmt` to format.

## Documentation

Most kaboom docs are written in `src/types.ts` as [jsDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) above each kaboom component entry.

**Help on improving the documentation is appreciated! Thank you for contributing!**
