class PerspectiveCamera extends Observer {
    constructor(fovy, near, far) {
        super()
        this.setProjection(fovy, near, far)
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
        this.inversedProjection = mat4.inversePerspective(
            this.projectionMetaData.fovy,
            Surface.aspect,
            this.projectionMetaData.near,
            this.projectionMetaData.far)
    }
}
