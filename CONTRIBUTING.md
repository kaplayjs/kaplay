# Developing kaplay

1. `git clone https://github.com/marklovers/kaplay.git` to clone the repo.
1. `cd kaplay` to enter the project directory.
1. `pnpm install` to install dependencies.

## Editing examples

1. Pick on example to test and edit the corresponding `/examples/[name].js`, or
   create a new file under `/examples` to test anything you're working on.
1. The source entry point is `src/kaaplay.ts`, editing any files referenced will
   automatically trigger rebuild. **Make sure not to break any existing
   examples**.
1. Run `pnpm dev` to start the dev server and try examples.

## Documentation

Most kaboom docs are written in `src/types.ts` as
[jsDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
above each kaboom component entry.

**Help on improving the documentation is appreciated! Thank you for
contributing!**

# Before commit

1. follow conventional [conventional commits](#conventional-commits-guide)
   format. You can see how seeing the commit history.
2. `npm run check` to check typescript.
3. `npm run fmt` to format.

# Conventional Commits Guide

You must follow the following rules when writing commit messages:

A commit starts with a type, a scope, and a subject:

```
<type>(<scope>): <subject>
```

- The **type** is mandatory. [Should be one of the following](#commit-types).
- We don't use the **scope** right now, you must omit it. This may change in the
  future.
- The subject must be a short description of the change. Use the imperative,
  present tense: "change" not "changed" nor "changes".

### Commit types

`feat`: a new feature or part of a feature

```
feat: add hello() component
```

`fix`: a bug fix

```
fix: fix platformer example
```

`docs`: changes to documentation (jsDoc, md files, etc)

```
docs: update add() component jsDoc example
```

`style`: changes that do not affect the meaning of the code (white-space,
formatting, missing semi-colons, etc)

```
style: format all files
```

`refactor`: a code change that neither fixes a bug nor adds a feature

```
refactor: move assets to src/assets
```

`test`: adding missing tests or correcting existing tests

```
test: added tests for add() component
```

`build`: changes that affect the build system or external dependencies (esbuild,
typescript)

```
build: update esbuild to 0.12.0
```

`ci`: changes to our CI configuration files and scripts (Github Actions)

```
ci: add examples test workflow
```

`revert`: reverts a previous commit

```
revert: feat: add hello() component
```

`chore`: updating tasks, general maintenance, etc (anything that doesn't fit in
the above types)

```
chore: update README.md
```

`example`: adding a new example

```
example: add firework example
```
