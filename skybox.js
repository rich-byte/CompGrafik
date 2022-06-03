async function init() {
    let vertexShaderText = `
        precision mediump float;
        attribute vec3 vertPos;
        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;

        varying vec3 position;

        void main(){
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);
            position = vertPos;
        }
    `

    let fragmentShaderText = `
        precision mediump float;
        
        varying vec3 position;
        uniform samplerCube texture;

        void main() {
            // gl_FragColor = vec4(0,0.7,0,1);
            gl_FragColor = textureCube(texture, position);
        }
    `
    const canvas = document.getElementById("cg1")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl")

    const vertexShader = initVertexShader(gl, vertexShaderText)
    const fragmentShader = initFragShader(gl, fragmentShaderText)
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    const vertices = [
        // pos(x,y,z)
        // Top
		-1.0, 1.0, -1.0, 
		-1.0, 1.0, 1.0,  
		1.0, 1.0, 1.0,   
		1.0, 1.0, -1.0,  

		// Left
		-1.0, 1.0, 1.0,  
		-1.0, -1.0, 1.0, 
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0, 

		// Right
		1.0, 1.0, 1.0,   
		1.0, -1.0, 1.0,  
		1.0, -1.0, -1.0, 
		1.0, 1.0, -1.0,  

		// Front
		1.0, 1.0, 1.0,   
		1.0, -1.0, 1.0,  
		-1.0, -1.0, 1.0, 
		-1.0, 1.0, 1.0,  

		// Back
		1.0, 1.0, -1.0,  
		1.0, -1.0, -1.0, 
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0, 

		// Bottom
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0, 
		1.0, -1.0, 1.0,  
		1.0, -1.0, -1.0, 
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

    var positionAttribLocation = gl.getAttribLocation(program, "vertPos")
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
        )
    gl.enableVertexAttribArray(positionAttribLocation)

    gl.useProgram(program)

    var modelMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)
    var modelViewMatrix = new Float32Array(16)

    identity(modelMatrix)
    lookAt(viewMatrix, [0,0,-5], [0,0,0], [0,1,0])
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)
    multiply(modelViewMatrix, viewMatrix, modelMatrix)

    const modelViewLocation = gl.getUniformLocation(program, "modelViewMatrix")
    const projLocation = gl.getUniformLocation(program, "projMatrix")
    gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projectionMatrix)

    var yRotationMatrix = new Float32Array(16)
    var identityMatrix = new Float32Array(16)
    identity(identityMatrix)

    // texture cubemap
    const textureUniformLocation = gl.getUniformLocation(program, 'texture')
    gl.uniform1i(textureUniformLocation, 0)
    var texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
    var leftTexture = await loadTexture(gl, 'skybox/left.jpg', gl.TEXTURE_CUBE_MAP_POSITIVE_X)
    var rightTexture = await loadTexture(gl, 'skybox/right.jpg', gl.TEXTURE_CUBE_MAP_NEGATIVE_X)
    var topTexture = await loadTexture(gl, 'skybox/top.jpg', gl.TEXTURE_CUBE_MAP_POSITIVE_Y)
    var botTexture = await loadTexture(gl, 'skybox/bottom.jpg', gl.TEXTURE_CUBE_MAP_NEGATIVE_Y)
    var frontTexture = await loadTexture(gl, 'skybox/front.jpg', gl.TEXTURE_CUBE_MAP_POSITIVE_Z)
    var backTexture = await loadTexture(gl, 'skybox/back.jpg', gl.TEXTURE_CUBE_MAP_NEGATIVE_Z)

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

    gl.clearColor(0.2, 0.2, 0.2, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    var angle = 0
    var camX = 0
    var camZ = 0
    
    function draw() {
        gl.clearColor(0.2, 0.2, 0.2, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        rotateY(yRotationMatrix, identityMatrix, angle)
        multiply(modelMatrix, yRotationMatrix, identityMatrix)
        multiply(modelViewMatrix, viewMatrix, modelMatrix)
        gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)

        angle += 0.01
        camX += 0.01
        camZ += 0.01

        // gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

        requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
}

window.onload = init