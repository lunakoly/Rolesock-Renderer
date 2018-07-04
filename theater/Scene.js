class Scene {
    constructor(camera) {
        this.camera = camera
        this.container = new ContainerComponent()
        this.environment = new EnvironmentComponent()

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
        this.container.update(dt)
        this.environment.update(dt)
    }

    updateViewport() {
        if (this.camera) this.camera.updateViewport()
    }
}
