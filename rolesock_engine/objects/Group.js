class Group {
    constructor() {
        this.controller = new ControllerComponent()
        this.container = new ContainerComponent(this)
        this.model = new ModelComponent()
    }

    update(dt) {
        this.model.update(dt)
        this.container.update(dt)
        this.controller.update(dt)
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

    forEachPointLight(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.pointLightSources.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachPointLight(callback, modelMatrix))
    }
}
