import * as THREE from 'https://jspm.dev/three'

export function initSilhouette(scene) {

  const geometry = new THREE.ConeGeometry(4, 8, 3)
  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0xff00aa,
    emissiveIntensity: 0.3
  })

  const kuromi = new THREE.Mesh(geometry, material)
  kuromi.position.y = -2

  scene.add(kuromi)

  function pulse() {
    kuromi.rotation.y += 0.01
    requestAnimationFrame(pulse)
  }

  pulse()
}
