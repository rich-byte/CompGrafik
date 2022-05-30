async function init() {
    let vertexShaderText = `
        precision highp float;

        attribute vec3 vertPos;
        attribute vec2 vertTexCoord;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;
        
        varying vec2 texCoord;

        void main() {
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);
            texCoord = vertTexCoord;
        }
    `

    let fragmentShaderText = `
        precision highp float;

        varying vec2 texCoord;
        
        uniform sampler2D inTexture;

        void main() {
            // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
            gl_FragColor = texture2D(inTexture, texCoord);
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

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPos')
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(positionAttribLocation)

    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord')
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

    
    var modelViewMatrixtUniformLocation = gl.getUniformLocation(program, "modelViewMatrix")
    var projectionMatrixUniformLocation = gl.getUniformLocation(program, "projMatrix")
    var inTextureUniformLocation = gl.getUniformLocation(program, 'inTexture')
    
    var texture = await loadTexture(gl, 'Texture.png', gl.TEXTURE_2D)

    var worldMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)
    var modelViewMatrix = new Float32Array(16)

    identity(worldMatrix)
    lookAt(viewMatrix, [-8.0, 3.0, -8.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0])
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)
    multiply(modelViewMatrix, viewMatrix, worldMatrix)

    gl.uniformMatrix4fv(modelViewMatrixtUniformLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, gl.FALSE, projectionMatrix)
    gl.uniform1i(inTextureUniformLocation, 0)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.clearColor(0.2, 0.2, 0.2, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
    // second cube
    translateVec = new Float32Array(3)
    translateVec[0] = -3
    translatedWorldMatrix = worldMatrix
    translate(translatedWorldMatrix, worldMatrix, translateVec)
    multiply(translatedWorldMatrix, viewMatrix, translatedWorldMatrix)

    const textureVid = gl.createTexture()
    const video = await setupVideo('video')
    gl.bindTexture(gl.TEXTURE_2D, textureVid)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

    
    function draw() {
        gl.uniformMatrix4fv(modelViewMatrixtUniformLocation, gl.FALSE, modelViewMatrix)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

        gl.uniformMatrix4fv(modelViewMatrixtUniformLocation, gl.FALSE, translatedWorldMatrix)
        gl.bindTexture(gl.TEXTURE_2D, textureVid)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
        requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
}

window.onload = init