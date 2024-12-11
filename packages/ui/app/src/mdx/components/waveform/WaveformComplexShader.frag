struct GradientStop {
  vec4 color;
  float position;
};

#define NUM_GRADIENT_STOPS (7)
#define TEXTURE_NOISE_OPACITY (0.006)

varying vec2 vUv;
uniform float uGradientRepeat;
uniform GradientStop uGradientStops[NUM_GRADIENT_STOPS];

void setGradientColor(
  GradientStop colors[NUM_GRADIENT_STOPS],
  float factor,
  out vec4 finalColor
) {
  int index = 0;
  float repeatedFactor = fract(factor * uGradientRepeat);

  for (int i = 0; i < NUM_GRADIENT_STOPS - 1; i++) {
    GradientStop currentColor = colors[i];
    if (currentColor.position <= repeatedFactor) {
      index = i;
    }
  }

  GradientStop currentColor = colors[index];
  GradientStop nextColor = colors[index + 1];
  float range = nextColor.position - currentColor.position;
  float lerpFactor = smoothstep(
    0.0,
    1.0,
    (repeatedFactor - currentColor.position) / range
  );

  finalColor.rgb = mix(currentColor.color.rgb, nextColor.color.rgb, lerpFactor);
  finalColor.a = mix(currentColor.color.a, nextColor.color.a, lerpFactor);
}

float random(vec2 p) {
  vec2 K1 = vec2(
    23.14069263277926, // e^pi (Gelfond's constant)
    2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
  );
  return fract(cos(dot(p, K1)) * 12345.6789);
}

void main() {
  vec4 finalColor;
  vec2 uvScreen = gl_FragCoord.xy;

  setGradientColor(uGradientStops, vUv.y, finalColor);

  finalColor.rgb += random(uvScreen) * TEXTURE_NOISE_OPACITY;

  gl_FragColor = finalColor;
}
