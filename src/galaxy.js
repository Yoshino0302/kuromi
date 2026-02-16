import * as THREE from 'https://jspm.dev/three'

export function initGalaxy(scene) {

  const particles = 6000
  const geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(particles * 3)
  const colors = new Float32Array(particles * 3)

  for (let i = 0; i < particles; i++) {
    const radius = Math.random() * 40
    const angle = radius * 0.3
    const branchAngle = (i % 3) * (Math.PI * 2 / 3)

    const x = Math.cos(angle + branchAngle) * radius
    const z = Math.sin(angle + branchAngle) * radius
    const y = (Math.random() - 0.5) * 5

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    colors[i * 3] = 1
    colors[i * 3 + 1] = 0
    colors[i * 3 + 2] = 0.5
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true
  })

  const galaxy = new THREE.Points(geometry, material)
  scene.add(galaxy)

  function animate() {
    galaxy.rotation.y += 0.0008
    requestAnimationFrame(animate)
  }

  animate()
}
