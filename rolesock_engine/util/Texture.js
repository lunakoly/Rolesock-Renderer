/**
* Convenient way of managing textures
*/
class Texture {
    constructor() {
        this.texture = Renderer.gl.createTexture()
        this.height = 16
        this.width = 16
        this.type = null
    }

    /**
    * Adds additional offset & scale parameters
    */
    complicate() {
        this.offset = { x: 0, y: 0 }
        this.scale = { x: 1, y: 1 }
        return this
    }

    /**
    * Sets up texture to play horizontal frame
    * animation
    */
    animateHorizontal(duration, framesCount) {
        this.scale.x = 1 / framesCount
        this.duration = duration
        this.frameTime = duration / framesCount

        this.update = dt => {
            const index = Math.floor(new Date().getTime() % this.duration / this.frameTime)
            this.offset.x = index / framesCount
        }
    }

    /**
    * Sets up texture to play vertical frame
    * animation
    */
    animateVertical(duration, framesCount) {
        this.scale.y = 1 / framesCount
        this.duration = duration
        this.frameTime = duration / framesCount

        this.update = dt => {
            const index = Math.floor(new Date().getTime() % this.duration / this.frameTime)
            this.offset.y = index / framesCount
        }
    }

    update(dt) {

    }

    assumingItIs(type) {
        this.type = type
        Renderer.gl.bindTexture(type, this.texture)
        return this
    }

    assumingItIs2D() {
        return this.assumingItIs(Renderer.gl.TEXTURE_2D)
    }

    assumingItIsCube() {
        return this.assumingItIs(Renderer.gl.TEXTURE_CUBE_MAP)
    }

    make() {
        return this.assumingItIs(this.type)
    }

    unbind() {
        Renderer.gl.bindTexture(this.type, null)
        return this
    }

    useNoFiltering() {
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_MAG_FILTER, Renderer.gl.NEAREST)
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_MIN_FILTER, Renderer.gl.NEAREST)
        return this
    }

    useLinearFiltering() {
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_MAG_FILTER, Renderer.gl.LINEAR)
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_MIN_FILTER, Renderer.gl.LINEAR)
        return this
    }

    useGoodMipmapFiltering() {
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_MAG_FILTER, Renderer.gl.LINEAR)
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_MIN_FILTER, Renderer.gl.LINEAR_MIPMAP_LINEAR)
        Renderer.gl.generateMipmap(this.type)
        return this
    }

    doClamp() {
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_WRAP_T, Renderer.gl.CLAMP_TO_EDGE)
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_WRAP_S, Renderer.gl.CLAMP_TO_EDGE)
        return this
    }

    doRepeat() {
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_WRAP_T, Renderer.gl.REPEAT)
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_WRAP_S, Renderer.gl.REPEAT)
        return this
    }

    doMirror() {
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_WRAP_T, Renderer.gl.MIRRORED_REPEAT)
        Renderer.gl.texParameteri(this.type, Renderer.gl.TEXTURE_WRAP_S, Renderer.gl.MIRRORED_REPEAT)
        return this
    }

    scale(width, height) {
        this.height = height
        this.width = width
        return this
    }

    scaleToScreen() {
        this.height = Surface.space.clientHeight
        this.width = Surface.space.clientWidth
        return this
    }

    beColor2D() {
        Renderer.gl.texImage2D(this.type, 0, Renderer.gl.RGBA, this.width, this.height, 0, Renderer.gl.RGBA, Renderer.gl.UNSIGNED_BYTE, null)
        return this
    }

    beDepth2D() {
        Renderer.gl.texImage2D(this.type, 0, Renderer.gl.DEPTH_COMPONENT, this.width, this.height, 0, Renderer.gl.DEPTH_COMPONENT, Renderer.gl.UNSIGNED_SHORT, null)
        return this
    }

    beColorCube() {
        for (let it = 0; it < 6; it++)
            Renderer.gl.texImage2D(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_X + it, 0, Renderer.gl.RGBA, this.width, this.height, 0, Renderer.gl.RGBA, Renderer.gl.UNSIGNED_BYTE, null)
        return this
    }

    beDepthCube() {
        for (let it = 0; it < 6; it++)
            Renderer.gl.texImage2D(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_X + it, 0, Renderer.gl.DEPTH_COMPONENT, this.width, this.height, 0, Renderer.gl.DEPTH_COMPONENT, Renderer.gl.UNSIGNED_SHORT, null)
        return this
    }

    beImage(image) {
        this.width = image.naturalWidth
        this.height = image.naturalHeight
        Renderer.gl.texImage2D(Renderer.gl.TEXTURE_2D, 0, Renderer.gl.RGBA, Renderer.gl.RGBA, Renderer.gl.UNSIGNED_BYTE, image)
        return this
    }


    static color2D() {
        return new Texture().assumingItIs2D().useNoFiltering().doClamp().beColor2D().unbind()
    }

    static depth2D(size) {
        return new Texture().assumingItIs2D().useLinearFiltering().doClamp().scale(size, size).beDepth2D().unbind()
    }

    static screenColor() {
        return new Texture().assumingItIs2D().useNoFiltering().doClamp().scaleToScreen().beColor2D().unbind()
    }

    static screenDepth() {
        return new Texture().assumingItIs2D().useNoFiltering().doClamp().scaleToScreen().beDepth2D().unbind()
    }

    static colorCube(size) {
        return new Texture().assumingItIsCube().useNoFiltering().doClamp().scale(size, size).beColorCube().unbind()
    }

    static depthCube(size) {
        return new Texture().assumingItIsCube().useNoFiltering().doClamp().scale(size, size).beDepthCube().unbind()
    }

    /**
    * Returns true if image width & height are of
    * power of 2 size
    */
    static isPowerOfTwo(image) {
        if (image.naturalWidth == 0 || image.naturalHeight == 0) return false
        const f = n => (n & (n - 1)) == 0   // is power of two
        return f(image.naturalWidth) && f(image.naturalHeight)
    }

    /**
    * Sets up texture from image source
    */
    static fromImage(src, doMipmaping) {
        doMipmaping = doMipmaping != undefined ? doMipmaping : true

        const texture = new Texture().complicate()
        const image = new Image()

        image.onload = _ => {
            texture.assumingItIs2D().doClamp().useLinearFiltering().beImage(image)

            if (Texture.isPowerOfTwo(image)) {
                texture.doRepeat()
                if (doMipmaping) texture.useGoodMipmapFiltering()
            }

            texture.unbind()
        }

        image.src = src
        return texture
    }
}
