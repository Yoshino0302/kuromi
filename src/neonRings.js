import * as THREE from 'https://jspm.dev/three'

export function initNeonRings(scene) {

  const rings = []

  for (let i = 0; i < 5; i++) {
    const geo = new THREE.TorusGeometry(3 + i, 0.05, 16, 100)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00aa
    })

    const ring = new THREE.Mesh(geo, mat)
    ring.rotation.x = Math.random() * Math.PI
    ring.rotation.y = Math.random() * Math.PI

    scene.add(ring)
    rings.push(ring)
  }

  function animate() {
    rings.forEach((r, i) => {
      r.rotation.z += 0.005 + i * 0.001
    })
    requestAnimationFrame(animate)
  }

  animate()
}
