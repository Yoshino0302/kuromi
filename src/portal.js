import * as THREE from 'https://jspm.dev/three'

export function initPortal(scene, camera) {

  const geometry = new THREE.TorusGeometry(5, 0.4, 32, 200)
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0088,
    emissive: 0xff0088,
    emissiveIntensity: 2,
    metalness: 1,
    roughness: 0
  })

  const portal = new THREE.Mesh(geometry, material)
  portal.visible = false
  scene.add(portal)

  document.getElementById('enterBtn').addEventListener('click', () => {

    portal.visible = true

    let scale = 0.1
    portal.scale.set(scale, scale, scale)

    function expand() {
      scale += 0.05
      portal.scale.set(scale, scale, scale)
      portal.rotation.x += 0.1
      portal.rotation.y += 0.1

      camera.position.z -= 0.2

      if (scale < 10) {
        requestAnimationFrame(expand)
      }
    }

    expand()
  })
}
