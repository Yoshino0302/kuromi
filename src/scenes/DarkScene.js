import * as THREE from 'https://jspm.dev/three'
import { initPortal } from '../effects/portal.js'

export class DarkScene {

  constructor(camera) {
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
  }

  init() {

    // ---------- CAMERA ----------
    this.camera.position.set(0, 0, 35)

    // ---------- FOG ----------
    this.scene.fog = new THREE.FogExp2(0x0a0015, 0.045)

    // ---------- ENERGY CORE ----------
    const coreGeo = new THREE.TorusGeometry(8, 2.5, 64, 200)

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff00aa,
      emissive: 0xff0088,
      emissiveIntensity: 4,
      metalness: 1,
      roughness: 0
    })

    this.core = new THREE.Mesh(coreGeo, coreMat)
    this.scene.add(this.core)

    // ---------- INNER GLOW ----------
    const glowGeo = new THREE.SphereGeometry(5, 64, 64)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })

    this.glowSphere = new THREE.Mesh(glowGeo, glowMat)
    this.scene.add(this.glowSphere)

    // ---------- PORTAL SHADER ----------
    const portalData = initPortal(this.scene)
    this.portal = portalData.portal
    this.portalUpdate = portalData.update

    // ---------- FLOATING SHARDS ----------
    const shardGeo = new THREE.IcosahedronGeometry(0.6, 0)
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xff00aa,
      emissive: 0xff00aa,
      emissiveIntensity: 3,
      metalness: 1,
      roughness: 0
    })

    this.shards = []

    for (let i = 0; i < 60; i++) {
      const shard = new THREE.Mesh(shardGeo, shardMat)

      const radius = 15 + Math.random() * 10
      const angle = Math.random() * Math.PI * 2

      shard.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 20,
        Math.sin(angle) * radius
      )

      shard.userData = {
        baseRadius: radius,
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
      }

      this.scene.add(shard)
      this.shards.push(shard)
    }

    // ---------- LIGHTS ----------
    const mainLight = new THREE.PointLight(0xff00aa, 8, 200)
    mainLight.position.set(10, 10, 10)
    this.scene.add(mainLight)

    const rimLight = new THREE.PointLight(0xff0088, 6, 200)
    rimLight.position.set(-15, -10, -10)
    this.scene.add(rimLight)
  }

  update() {

    const elapsed = this.clock.getElapsedTime()

    // ---------- CORE ROTATION ----------
    this.core.rotation.x += 0.01
    this.core.rotation.y += 0.015

    // ---------- PULSE ----------
    const pulse = 1 + Math.sin(elapsed * 3) * 0.08
    this.glowSphere.scale.set(pulse, pulse, pulse)

    // ---------- PORTAL UPDATE ----------
    if (this.portalUpdate) {
      this.portalUpdate(elapsed)
    }

    // ---------- SHARDS ORBIT ----------
    this.shards.forEach((shard) => {
      const { baseRadius, speed, offset } = shard.userData

      const angle = elapsed * speed + offset
      const radius = baseRadius

      shard.position.x = Math.cos(angle) * radius
      shard.position.z = Math.sin(angle) * radius

      shard.rotation.x += 0.02
      shard.rotation.y += 0.03
    })

    // ---------- CINEMATIC CAMERA ----------
    this.camera.position.x = Math.sin(elapsed * 0.3) * 3
    this.camera.position.y = Math.cos(elapsed * 0.2) * 2
    this.camera.lookAt(0, 0, 0)
  }

  dispose() {
    this.scene.clear()
  }
}
