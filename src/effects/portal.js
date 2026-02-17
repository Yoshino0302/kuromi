import * as THREE from 'https://jspm.dev/three'

export function initPortal(scene) {

  const geometry = new THREE.TorusGeometry(10, 1.2, 128, 256)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0xff00ff) },
      uColor2: { value: new THREE.Color(0x9900ff) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;

        vec3 pos = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;

      varying vec2 vUv;
      varying vec3 vPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy,
            vec2(12.9898,78.233)))*
            43758.5453123);
      }

      void main() {

        vec2 uv = vUv;

        // Center UV
        vec2 centered = uv - 0.5;

        float angle = atan(centered.y, centered.x);
        float radius = length(centered);

        // Swirl effect
        float swirl = sin(radius * 20.0 - uTime * 4.0 + angle * 6.0);

        // Energy waves
        float wave = sin(radius * 40.0 - uTime * 6.0);

        float intensity = smoothstep(0.4, 0.0, radius);
        intensity += swirl * 0.4;
        intensity += wave * 0.3;

        vec3 color = mix(uColor2, uColor1, intensity);

        // Fresnel edge glow
        float fresnel = pow(1.0 - abs(dot(normalize(vPosition), vec3(0.0, 0.0, 1.0))), 3.0);
        color += uColor1 * fresnel * 2.0;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })

  const portal = new THREE.Mesh(geometry, material)
  scene.add(portal)

  portal.userData = { material }

  function update(time) {
    material.uniforms.uTime.value = time
    portal.rotation.x += 0.005
    portal.rotation.y += 0.008
  }

  return { portal, update }
}
