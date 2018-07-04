class Group {
    constructor() {
        this.container = new ContainerComponent()
        this.model = new ModelComponent()
    }

    update(dt) {
        this.model.update(dt)
        this.container.update(dt)
    }

    forEachOpaque(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.opaqueChildren.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachOpaque(callback, modelMatrix))
    }

    forEachTransparent(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.transparentChildren.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachTransparent(callback, modelMatrix))
    }

    forEachDirectionalLight(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.directionalLightSources.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachDirectionalLight(callback, modelMatrix))
    }
}
