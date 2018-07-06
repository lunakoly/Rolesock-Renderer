/**
* Observer with projection (ortho) matrix
*/
class OrthoCamera extends Observer {
    constructor(near, far) {
        super()
        this.setProjection(near, far)
    }

    /**
    * Sets projection parameters
    */
    setProjection(near, far) {
        this.projectionMetaData = {
            near: near,
            far: far
        }
        this.updateViewport()
    }

    /**
    * Updates projection matrices
    */
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
