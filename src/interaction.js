export function initInteraction(camera) {

  let targetX = 0
  let targetY = 0

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 6
    targetY = (e.clientY / window.innerHeight - 0.5) * 6
  })

  function animate() {
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (-targetY - camera.position.y) * 0.05
    requestAnimationFrame(animate)
  }

  animate()
}
