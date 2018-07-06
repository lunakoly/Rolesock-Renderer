/**
* Object that specifies static local transformation
* origin for several other objects and provides
* scene with environment settings and
* camera management
*/
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

    /**
    * Updates viewport of the active camera
    */
    updateViewport() {
        if (this.camera) this.camera.updateViewport()
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of opaque child objects
    */
    forEachOpaque(callback) {
        this.container.opaqueChildren.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachOpaque(callback, Renderer.emptyMatrix))
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of transparent child objects
    */
    forEachTransparent(callback) {
        this.container.transparentChildren.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachTransparent(callback, Renderer.emptyMatrix))
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of directional light child observer
    */
    forEachDirectionalLight(callback) {
        this.container.directionalLightSources.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachDirectionalLight(callback, Renderer.emptyMatrix))
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of point light child observer
    */
    forEachPointLight(callback) {
        this.container.pointLightSources.forEach(it => callback(it, Renderer.emptyMatrix))
        this.container.containerChildren.forEach(it => it.forEachPointLight(callback, Renderer.emptyMatrix))
    }
}
