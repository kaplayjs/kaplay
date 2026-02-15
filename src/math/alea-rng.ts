// Algorithm by Johannes Baagøe
// The original article isn't online anymore, but there is a snapshot on internet archive:
// http://web.archive.org/web/20101106000458/http://baagoe.com/en/RandomMusings/javascript/
// This is the slim TypeScript variant of this implementation:
// https://github.com/coverslide/node-alea

export const getRandomSeeds = () => {
    return [
        Math.random().toString(36).slice(2),
        Math.random().toString(36).slice(2),
        Math.random().toString(36).slice(2),
    ];
};

const Alea = (...seeds: string[]): () => number => {
    const getMash = () => {
        let n = 0xefc8249d;

        const mash = (seed: string): number => {
            for (let i = 0; i < seed.length; i++) {
                n += seed.charCodeAt(i);
                let h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        };

        return mash;
    };

    const mash = getMash();
    const s = [mash(" "), mash(" "), mash(" ")];
    let c = 1;

    seeds = seeds.length > 0 ? seeds : getRandomSeeds();

    seeds.forEach((seed) => {
        s.forEach((_, i) => {
            s[i] -= mash(seed);

            if (s[i] < 0) {
                s[i] += 1;
            }
        });
    });

    const random = () => {
        const t = 2091639 * s[0] + c * 2.3283064365386963e-10; // 2^-32
        c = t | 0; // quicker floor
        s[0] = s[1];
        s[1] = s[2];
        s[2] = t - c;
        return s[2];
    };

    return random;
};

export default Alea;
