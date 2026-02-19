export class MemoryTracker {
    constructor() {
        this.geometries = new Set()
        this.materials = new Set()
        this.textures = new Set()
    }
    trackGeometry(geometry) {
        this.geometries.add(geometry)
        return geometry
    }
    trackMaterial(material) {
        this.materials.add(material)
        return material
    }
    trackTexture(texture) {
        this.textures.add(texture)
        return texture
    }
    disposeAll() {
        this.geometries.forEach(g => g.dispose())
        this.materials.forEach(m => m.dispose())
        this.textures.forEach(t => t.dispose())
        this.geometries.clear()
        this.materials.clear()
        this.textures.clear()
    }
}
