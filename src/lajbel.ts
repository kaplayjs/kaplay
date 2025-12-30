import { _k } from "./shared";

export const lajbel = () => {
    const positiveLajbelResponse = _k.k.choose([
        "cool",
        "makes sense",
        "ok",
        "kewl",
        "i see",
        "really cool",
        "okay"
    ]);

    return positiveLajbelResponse;
};
