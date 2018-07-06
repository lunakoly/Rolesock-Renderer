/**
* Non-drawable layer entity that can have
* holder - object used as an origin for
* own transformations
*/
class Observer {
    constructor() {
        this.model = new ModelComponent()
        this.holder = null
    }

    update(dt) {
        this.model.update(dt)
    }

    /**
    * Returns global total model matrix
    */
    getModel() {
        let obj = this.holder
        let modelMatrix = this.model.total()

        while (obj && obj.model) {
            modelMatrix = obj.model.total().xM(modelMatrix)
            obj = obj.holder
        }

        return modelMatrix
    }

    /**
    * Returns inversed global total model matrix
    */
    getInversedModel() {
        let obj = this.holder
        let modelMatrix = this.model.inversed()

        while (obj && obj.model) {
            modelMatrix = modelMatrix.xM(obj.model.inversed())
            obj = obj.holder
        }

        return modelMatrix
    }

    /**
    * Returns global rotation matrix
    */
    getRotationMatrix() {
        let obj = this.holder
        let matrix = this.model.rotationMatrix

        while (obj && obj.model) {
            matrix = obj.model.rotationMatrix.xM(matrix)
            obj = obj.holder
        }

        return matrix
    }
}
