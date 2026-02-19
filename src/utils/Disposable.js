
export class Disposable {

    constructor() {

        this._disposed = false

    }

    get disposed() {

        return this._disposed

    }

    dispose() {

        if (this._disposed) return

        this._disposed = true

        this.onDispose()

    }

    onDispose() {
        // override in subclasses
    }

}

