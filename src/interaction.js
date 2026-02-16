export function initInteraction(camera) {

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = (e.clientY / window.innerHeight - 0.5) * 2

    camera.position.x = x * 3
    camera.position.y = -y * 3
  })
}
