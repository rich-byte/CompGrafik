'use strict'

async function init() {
    let vertexShaderText = `
        precision mediump float;

        attribute vec3 vertPos;
        attribute vec2 vertTex;

        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;

        varying vec2 textureCoord;

        void main(void) {
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);
            textureCoord = vertTex;
        }
    `
    let fragmentShaderText = `
        precision mediump float;

        varying vec2 textureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            // gl_FragColor = texture2D(uSampler, textureCoord);
            gl_FragColor = vec4(0.0,1.0,0.0,1.0);
        }
    `

    const canvas = document.getElementById("cg1")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl")

    const vertexShader = initVertexShader(gl, vertexShaderText)
    const fragShader = initFragShader(gl, fragmentShaderText)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    const vertices = [
        // pos(x,y,z), texture(u,v)
        // Top
		-1.0, 1.0, -1.0,   0.0, 0.0,
		-1.0, 1.0, 1.0,    1.0, 0.0,
		1.0, 1.0, 1.0,     1.0, 1.0,
		1.0, 1.0, -1.0,    0.0, 1.0,

		// Left
		-1.0, 1.0, 1.0,    0.0, 0.0,
		-1.0, -1.0, 1.0,   1.0, 0.0,
		-1.0, -1.0, -1.0,  1.0, 1.0,
		-1.0, 1.0, -1.0,   0.0, 1.0,

		// Right
		1.0, 1.0, 1.0,     0.0, 0.0,
		1.0, -1.0, 1.0,    1.0, 0.0,
		1.0, -1.0, -1.0,   1.0, 1.0,
		1.0, 1.0, -1.0,    0.0, 1.0,

		// Front
		1.0, 1.0, 1.0,     0.0, 0.0,
		1.0, -1.0, 1.0,    1.0, 0.0,
		-1.0, -1.0, 1.0,   1.0, 1.0,
		-1.0, 1.0, 1.0,    0.0, 1.0,

		// Back
		1.0, 1.0, -1.0,    0.0, 0.0,
		1.0, -1.0, -1.0,   1.0, 0.0,
		-1.0, -1.0, -1.0,  1.0, 1.0,
		-1.0, 1.0, -1.0,   0.0, 1.0,

		// Bottom
		-1.0, -1.0, -1.0,  0.0, 0.0,
		-1.0, -1.0, 1.0,   1.0, 0.0,
		1.0, -1.0, 1.0,    1.0, 1.0,
		1.0, -1.0, -1.0,   0.0, 1.0,
    ]

    var indices = [
        // Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

        // Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23,
    ]

    const vbo = vboSetup(gl, vertices)
    const ibo = iboSetup(gl, indices)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)

    const texture = loadTexture(gl, 'Texture.png')
    const textureCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)

    var positionAttribLocation = gl.getAttribLocation(program, "vertPos")
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(positionAttribLocation)

    var texCoordAttribLocation = gl.getAttribLocation(program, "vertTex")
    gl.vertexAttribPointer(
        texCoordAttribLocation,
        2,
        gl.FLOAT, 
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(texCoordAttribLocation)

    gl.useProgram(program)

    var modelViewMatrixLocation = gl.getUniformLocation(program, "modelViewMatrix")
    var projMatrixLocation = gl.getUniformLocation(program, "projMatrix")
    var samplerLocation = gl.getUniformLocation(program, "uSampler")

    var worldMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projMatrix = new Float32Array(16)

    identity(worldMatrix)
    lookAt(viewMatrix, [0,0,-5], [0,0,0], [0,1,0]) // first is Eye -> cam pos; second is Look -> point to look at; third is Up -> vertical from cam
    perspective(projMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)
    var modelViewMatrix = new Float32Array(16)
    multiply(modelViewMatrix, worldMatrix, viewMatrix)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.uniformMatrix4fv(modelViewMatrixLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projMatrixLocation, gl.FALSE, projMatrix)
    gl.uniform1i(samplerLocation, 0)

    gl.clearColor(0.4, 0.4, 0.4, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

window.onload = init