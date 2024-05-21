## Developing Kaplay

1. `pnpm install` to install dev packages.
2. `pnpm run dev` to start dev server. (use `pnpm run win:dev if you are in Windows`)
3. Pick on example to test and edit the corresponding `/examples/[name].js`, or create a new file under `/examples` to test anything you're working on.
4. The source entry point is `src/kaboom.ts`, editing any files referenced will automatically trigger rebuild. **Make sure not to break any existing examples**.
5. **Before commit** `npm run check` to check typescript, `npm run fmt` to format.

## Documentation

Most kaboom docs are written in `src/types.ts` as [jsDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) above each kaboom component entry.

**Help on improving the documentation is appreciated! Thank you for contributing!**
