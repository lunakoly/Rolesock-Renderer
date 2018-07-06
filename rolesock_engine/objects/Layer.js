class Layer {
    constructor(camera) {
        this.camera = camera
        this.container = new ContainerComponent(this)
        this.environment = new EnvironmentComponent()
        this.controller = new ControllerComponent()

        this.container.addLightSource(this.environment.sun)
        this.initEvents()
    }

    initEvents() {
        this.cameraControls = null

        Surface.on('mousedown', e => {
            if (this.cameraControls) this.cameraControls.onMouseDown(e)
        })

        Surface.on('drag', e => {
            if (this.cameraControls) this.cameraControls.onDrag(e)
        })
    }

    update(dt) {
        if (this.camera) this.camera.update(dt)
        this.container.update(dt)
        this.environment.update(dt)
        this.controller.update(dt)
    }

    updateViewport() {
        if (this.camera) this.camera.updateViewport()
    }

    forEachOpaque(callback) {
        this.container.opaqueChildren.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachOpaque(callback, Renderer.emptyMatrix))
    }

    forEachTransparent(callback) {
        this.container.transparentChildren.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachTransparent(callback, Renderer.emptyMatrix))
    }

    forEachDirectionalLight(callback) {
        this.container.directionalLightSources.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachDirectionalLight(callback, Renderer.emptyMatrix))
    }

    forEachPointLight(callback) {
        this.container.pointLightSources.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachPointLight(callback, Renderer.emptyMatrix))
    }
}
