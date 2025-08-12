declare module "*.png" {
    const value: string;
    export default value;
}

declare module "*.mp3" {
    const value: Uint8Array;
    export default value;
}

interface Window {
    kaplayjs_assetsAliases: Record<string, string>;
}
