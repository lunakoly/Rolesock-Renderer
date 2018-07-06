/**
* Represents shader program object
* and encapsulates the corresponding functionality
*/
class ShaderProgram {
    constructor(pack) {
        this.pack = pack

        const fragment = this.genShader(pack.fragment, Renderer.gl.FRAGMENT_SHADER)
        const vertex   = this.genShader(pack.vertex,   Renderer.gl.VERTEX_SHADER)

        this.program = Renderer.gl.createProgram()
        Renderer.gl.attachShader(this.program, fragment)
        Renderer.gl.attachShader(this.program, vertex)
        Renderer.gl.linkProgram(this.program)

        if (!Renderer.gl.getProgramParameter(this.program, Renderer.gl.LINK_STATUS)) {
            console.error('ShaderProgram: could not link program')
            console.error(Renderer.gl.getProgramInfoLog(this.program))
            this.program = 0
        }

        this.namespace = {}
    }

    /**
    * Returns WebGL shader object
    * build from source code
    */
    genShader(source, type) {
        const shader = Renderer.gl.createShader(type)
        Renderer.gl.shaderSource(shader, source)
        Renderer.gl.compileShader(shader)

        if (!Renderer.gl.getShaderParameter(shader, Renderer.gl.COMPILE_STATUS)) {
            console.error('ShaderProgram: could not compile ' +
                (type == Renderer.gl.VERTEX_SHADER ? 'vertex' : 'fragment') + 'shader')
            console.error(Renderer.gl.getShaderInfoLog(shader))
            shader = 0
        }

        return shader
    }

    /**
    * Returns true if Renderer is currently
    * using this particular program
    */
    isUsed() {
        return Renderer.lastUsedProgram == this
    }

    /**
    * Makes Renderer use this particular program
    */
    use() {
        Renderer.gl.useProgram(this.program)
        Renderer.lastUsedProgram = this
    }

    /**
    * If not used, uses itself and sets up common uniforms
    * taken from the options
    */
    ensureUsage(options) {
        if (!this.isUsed()) {
            this.use()
            this.setUniformMatrix4fv(options.viewMatrix, 'uViewMatrix')
            this.setUniformMatrix4fv(options.projectionMatrix, 'uProjectionMatrix')
            this.setUniformMatrix4fv(options.inversedViewMatrix, 'uInversedViewMatrix')
            this.setUniformMatrix4fv(options.inversedProjectionMatrix, 'uInversedProjectionMatrix')
            this.setUniform1f(Surface.aspect, 'uAspect')
        }
    }

    setAttribute(buffer, size, name) {
        const attrib = Renderer.gl.getAttribLocation(this.program, name)
        Renderer.gl.enableVertexAttribArray(attrib)
        Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, buffer)
        Renderer.gl.vertexAttribPointer(attrib, size, Renderer.gl.FLOAT, false, 0, 0)
    }

    setUniformMatrix4fv(mat, name) {
        const uniform = Renderer.gl.getUniformLocation(this.program, name)
        Renderer.gl.uniformMatrix4fv(uniform, false, new Float32Array(mat.flatten()))
    }

    setUniform1f(val, name) {
        const uniform = Renderer.gl.getUniformLocation(this.program, name)
        Renderer.gl.uniform1f(uniform, val)
    }

    setUniform1i(val, name) {
        const uniform = Renderer.gl.getUniformLocation(this.program, name)
        Renderer.gl.uniform1i(uniform, val)
    }

    setUniform4f(x, y, z, w, name) {
        const uniform = Renderer.gl.getUniformLocation(this.program, name)
        Renderer.gl.uniform4f(uniform, x, y, z, w)
    }

    setVec4(vec, name) {
        this.setUniform4f(vec[0], vec[1], vec[2], vec[3], name)
    }

    setUniform3f(x, y, z, name) {
        const uniform = Renderer.gl.getUniformLocation(this.program, name)
        Renderer.gl.uniform3f(uniform, x, y, z)
    }

    setCubeMap(tex, unit, unitNumber, name) {
        const uniform = Renderer.gl.getUniformLocation(this.program, name)
        Renderer.gl.uniform1i(uniform, unitNumber)
        Renderer.gl.activeTexture(unit)
        Renderer.gl.bindTexture(Renderer.gl.TEXTURE_CUBE_MAP, tex)
    }

    setRawTexture(tex, unit, unitNumber, name) {
        const uniform = Renderer.gl.getUniformLocation(this.program, name)
        Renderer.gl.uniform1i(uniform, unitNumber)
        Renderer.gl.activeTexture(unit)
        Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, tex)
    }

    /**
    * Sets texture and additional scale & offset uniforms
    */
    setTexture(tex, unit, unitNumber, name) {
        this.setRawTexture(tex.texture, unit, unitNumber, name)
        this.setUniform1f(tex.scale.x, name + 'ScaleX')
        this.setUniform1f(tex.scale.y, name + 'ScaleY')
        this.setUniform1f(tex.offset.x, name + 'OffsetX')
        this.setUniform1f(tex.offset.y, name + 'OffsetY')
    }

    /**
    * Sets texture with it's additional uniforms (if it exists)
    * and sets flag value to 1 if succeeded (otherwise 0)
    */
    trySetTexture(tex, unit, unitNumber, flag, name) {
        if (tex) {
            this.setTexture(tex, unit, unitNumber, name)
            this.setUniform1i(1, flag)
        } else {
            this.setTexture(Renderer.emptyTexture, unit, unitNumber, name)
            this.setUniform1i(0, flag)
        }
    }

    /**
    * Sets all uniforms responsible for object material
    */
    useMaterial(mat) {
        this.setUniform1f(mat.opacity, 'uMaterial.opacity')
        this.setUniform1f(mat.shininess, 'uMaterial.shininess')
        this.setVec4(mat.diffuse, 'uMaterial.diffuse')
        this.setVec4(mat.specular, 'uMaterial.specular')
    }

    /**
    * Sets all uniforms responsible for object texture
    */
    useTexture(textureComponent) {
        this.trySetTexture(textureComponent.diffuse, Renderer.gl.TEXTURE0, 0,
                'uTexture.isDiffusePresented', 'uTexture.diffuse')
        this.trySetTexture(textureComponent.specular, Renderer.gl.TEXTURE1, 1,
                'uTexture.isSpecularPresented', 'uTexture.specular')
    }

    drawArrays(count) {
        Renderer.gl.drawArrays(Renderer.gl.TRIANGLE_STRIP, 0, count)
    }

    drawElements(orderBuffer, indicesCount) {
        Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, orderBuffer)
        Renderer.gl.drawElements(Renderer.gl.TRIANGLES, indicesCount, Renderer.gl.UNSIGNED_SHORT, 0)
    }
}
