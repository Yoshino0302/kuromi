export class RenderLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback
        this.renderCallback = renderCallback
        this.running = false
        this.lastTime = 0
        this.delta = 0
        this.maxDelta = 0.05
        this.boundLoop = this.loop.bind(this)
    }
    start() {
        if (this.running) return
        this.running = true
        this.lastTime = performance.now()
        requestAnimationFrame(this.boundLoop)
    }
    stop() {
        this.running = false
    }
    loop(now) {
        if (!this.running) return
        this.delta = (now - this.lastTime) / 1000
        this.lastTime = now
        if (this.delta > this.maxDelta)
            this.delta = this.maxDelta
        this.updateCallback(this.delta)
        this.renderCallback()
        requestAnimationFrame(this.boundLoop)
    }
}
