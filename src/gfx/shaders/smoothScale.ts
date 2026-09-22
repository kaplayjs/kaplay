/**
 * Box-filter upscaling shader for the rendered frame, used when
 * `crisp: "smooth"`. Every destination pixel is the weighted average of the
 * texels it covers, so pixels stay crisp while their edges are anti-aliased.
 *
 * Uniforms set by the frame renderer:
 * - `u_texSize`: size of the rendered frame, in texels
 * - `u_resolution`: size of the destination area, in canvas pixels
 */
export const SMOOTH_SCALE_FRAG = `
// The template defaults to mediump, which is too coarse for texel indices on
// high resolution games (few fp16 mantissa bits once multiplied by the texel
// size). Prefer highp where the fragment stage supports it.
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#endif

uniform vec2 u_texSize;
uniform vec2 u_resolution;

// Overlap of texel j with the destination pixel footprint [c - h, c + h]
float smooth_overlap(float c, float h, float j) {
    return clamp(min(c + h, j + 1.0) - max(c - h, j), 0.0, 1.0);
}

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    // Destination pixel center and half footprint, in texel space
    vec2 c = uv * u_texSize;
    vec2 h = 0.5 * u_texSize / u_resolution;

    // Scaling down: footprints wider than one texel need mip filtering to be
    // resolved, which this upscaler doesn't do. Fall back to the regular
    // sampling (the frame texture is linear-filtered in smooth mode).
    if (h.x >= 0.5 || h.y >= 0.5) {
        return def_frag();
    }

    // Covered texel indices, at most two per axis while the footprint is
    // smaller than one texel
    vec2 j0 = floor(c - h);
    vec2 j1 = j0 + 1.0;

    float wx0 = smooth_overlap(c.x, h.x, j0.x);
    float wx1 = smooth_overlap(c.x, h.x, j1.x);
    float wy0 = smooth_overlap(c.y, h.y, j0.y);
    float wy1 = smooth_overlap(c.y, h.y, j1.y);

    // Normalize, so footprints wider than one texel keep their full intensity
    float wx = wx0 + wx1;
    float wy = wy0 + wy1;
    wx0 /= wx;
    wx1 /= wx;
    wy0 /= wy;
    wy1 /= wy;

    // Sample texel centers, making the result independent of the texture filter
    vec2 lo = clamp(j0, vec2(0.0), u_texSize - 1.0);
    vec2 hi = clamp(j1, vec2(0.0), u_texSize - 1.0);
    vec2 loUv = (lo + 0.5) / u_texSize;
    vec2 hiUv = (hi + 0.5) / u_texSize;

    vec4 t00 = texture2D(tex, vec2(loUv.x, loUv.y));
    vec4 t10 = texture2D(tex, vec2(hiUv.x, loUv.y));
    vec4 t01 = texture2D(tex, vec2(loUv.x, hiUv.y));
    vec4 t11 = texture2D(tex, vec2(hiUv.x, hiUv.y));

    return t00 * (wx0 * wy0)
        + t10 * (wx1 * wy0)
        + t01 * (wx0 * wy1)
        + t11 * (wx1 * wy1);
}
`;
