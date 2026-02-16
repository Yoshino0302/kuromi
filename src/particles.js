import * as THREE from 'https://jspm.dev/three'

export function initParticles(scene) {

  const geometry = new THREE.BufferGeometry()
  const vertices = []

  for (let i = 0; i < 2000; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100)
    )
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  )

  const material = new THREE.PointsMaterial({
    color: 0xff0088,
    size: 0.3
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  function animate() {
    particles.rotation.y += 0.0008
    requestAnimationFrame(animate)
  }

  animate()
}
