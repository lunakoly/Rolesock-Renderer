class PerspectiveCamera {
    constructor(fovy, near, far) {
        this.model = new ObserverModelComponent()
        this.setProjection(fovy, near, far)
    }

    update(dt) {
        this.model.update(dt)
    }

    setProjection(fovy, near, far) {
        this.projectionMetaData = {
            fovy: fovy,
            near: near,
            far: far
        }
        this.updateViewport()
    }

    updateViewport() {
        this.projection = mat4.perspective(
            this.projectionMetaData.fovy,
            Surface.aspect,
            this.projectionMetaData.near,
            this.projectionMetaData.far)
        this.inverseProjection = mat4.inversePerspective(
            this.projectionMetaData.fovy,
            Surface.aspect,
            this.projectionMetaData.near,
            this.projectionMetaData.far)
    }
}
