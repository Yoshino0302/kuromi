import * as THREE from 'https://jspm.dev/three'
export class ResourceManager {
    constructor(memoryTracker) {
        this.memoryTracker = memoryTracker
        this.textureLoader = new THREE.TextureLoader()
        this.textures = new Map()
    }
    loadTexture(url) {
        if (this.textures.has(url))
            return this.textures.get(url)
        const texture = this.textureLoader.load(url)
        texture.colorSpace = THREE.SRGBColorSpace
        this.memoryTracker.trackTexture(texture)
        this.textures.set(url, texture)
        return texture
    }
    dispose() {
        this.textures.clear()
    }
}
