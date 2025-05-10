# TypeScript Advanced Features (TAF)

KAPLAY introduces several advanced TypeScript features to enhance the
development experience.

## Enable TAF

For enabling TAF, you need to pass a type option to the `kaplay()` function:

```ts
kaplay<{
    Enabled: true;
}>({
    // your other options
});
```
