uniform float u_time;
uniform vec3 u_fore;
uniform vec3 u_back;

float map(float x, float a, float b, float c, float d) {
    return c + (d - c) * (x - a) / (b - a);
}

#define pi 3.141592653589

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	vec4 pix = texture2D(tex, uv);
    float mixvalue = smoothstep(.3, .7, map(sin(u_time * pi), -1., 1., 0., 1.));
    if (pix.a > 0.) mixvalue = 1. - mixvalue;
    return mix(vec4(u_back / 255., 1.), vec4(u_fore / 255., 1.), mixvalue);
}
