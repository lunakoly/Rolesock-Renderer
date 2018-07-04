class OrthoCamera extends Observer {
    constructor(near, far) {
        super()
        this.setProjection(near, far)
    }

    setProjection(near, far) {
        this.projectionMetaData = {
            near: near,
            far: far
        }
        this.updateViewport()
    }

    updateViewport() {
        this.projection = mat4.ortho(
            Surface.aspect,
            this.projectionMetaData.near,
            this.projectionMetaData.far)
        this.inversedProjection = inverseOrtho(
            Surface.aspect,
            this.projectionMetaData.near,
            this.projectionMetaData.far)
    }
}
