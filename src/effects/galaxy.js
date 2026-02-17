import * as THREE from 'https://jspm.dev/three'

export function initGalaxy(scene) {

  const count = 8000
  const geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(count * 3)
  const randomness = new Float32Array(count)

  for (let i = 0; i < count; i++) {

    const radius = Math.random() * 40
    const branch = i % 4
    const branchAngle = (branch / 4) * Math.PI * 2

    const spinAngle = radius * 0.4

    const x = Math.cos(branchAngle + spinAngle) * radius
    const z = Math.sin(branchAngle + spinAngle) * radius
    const y = (Math.random() - 0.5) * 6

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    randomness[i] = Math.random()
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomness, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      attribute float aRandom;
      uniform float uTime;

      void main() {

        vec3 pos = position;

        float pulse = sin(uTime * 2.0 + aRandom * 10.0) * 0.5;
        pos += normalize(pos) * pulse;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 2.5;
      }
    `,
    fragmentShader: `
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(1.0, 0.0, 1.0, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  function update(time) {
    material.uniforms.uTime.value = time
    points.rotation.y += 0.0005
  }

  return { update }
}
