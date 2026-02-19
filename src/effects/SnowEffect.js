import * as THREE from 'https://jspm.dev/three'

export function initPortal(scene) {

  const geometry = new THREE.TorusGeometry(10, 1.2, 256, 512)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0xff00ff) },
      uColor2: { value: new THREE.Color(0x9900ff) }
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;

        float wave = sin(pos.x * 5.0 + uTime * 3.0) * 0.4;
        float twist = sin(pos.y * 6.0 + uTime * 4.0) * 0.3;

        pos += normal * (wave + twist);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;

      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {

        vec2 uv = vUv - 0.5;
        float r = length(uv);
        float angle = atan(uv.y, uv.x);

        float swirl = sin(r * 20.0 - uTime * 5.0 + angle * 4.0);
        float ring = sin(r * 50.0 - uTime * 8.0);

        float intensity = smoothstep(0.5, 0.0, r);
        intensity += swirl * 0.5;
        intensity += ring * 0.4;

        vec3 color = mix(uColor2, uColor1, intensity);

        float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 3.0);
        color += uColor1 * fresnel * 3.0;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const portal = new THREE.Mesh(geometry, material)
  scene.add(portal)

  function update(time) {
    material.uniforms.uTime.value = time
    portal.rotation.x += 0.004
    portal.rotation.y += 0.006
  }

  return { portal, update }
}
