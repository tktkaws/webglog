varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
    vec4 texColor = texture(tDiffuse, vUv);
    gl_FragColor = vec4(texColor.g, 0., 0., 1.);
    // gl_FragColor = texColor;
}