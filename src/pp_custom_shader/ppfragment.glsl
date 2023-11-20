uniform float uDivide;

uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {

    vec4 texel = texture2D(tDiffuse, vUv);
    vec4 cYellow = vec4(texel.r, texel.r, 0., 1.);
    vec4 cSkyBlue = vec4(0., texel.r, texel.r, 1.);
    float stepX = step(uDivide, vUv.x);
    gl_FragColor = mix(cYellow, cSkyBlue, stepX);

}