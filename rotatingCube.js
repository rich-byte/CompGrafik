'use strict';

async function init() {
    let vertexShaderText = await getFileText("http://127.0.0.1:5500/vertexShader")
    let fragmentShaderText = await getFileText("http://127.0.0.1:5500/fragmentShader")

    const canvas = document.getElementById("cg1")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl") 

    const vertexShader = initVertexShader(gl, vertexShaderText)
    const fragShader = initFragShader(gl, fragmentShaderText)
	
    const program = gl.createProgram()
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragShader)
	gl.linkProgram(program)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
	
    // x, y, z, R, G, B
	const vertices = 
    [
        // Top
		-1.0, 1.0, -1.0,   0.4, 0.1, 0.7,
		-1.0, 1.0, 1.0,    0.4, 0.1, 0.7,
		1.0, 1.0, 1.0,     0.4, 0.1, 0.7,
		1.0, 1.0, -1.0,    0.4, 0.1, 0.7,

		// Left
		-1.0, 1.0, 1.0,    0.4, 0.1, 0.7,
		-1.0, -1.0, 1.0,   1.0, 0.0, 0.15,
		-1.0, -1.0, -1.0,  1.0, 0.0, 0.15,
		-1.0, 1.0, -1.0,   0.4, 0.1, 0.7,

		// Right
		1.0, 1.0, 1.0,    0.4, 0.1, 0.7,
		1.0, -1.0, 1.0,   1.0, 0.0, 0.15,
		1.0, -1.0, -1.0,  1.0, 0.0, 0.15,
		1.0, 1.0, -1.0,   0.4, 0.1, 0.7,

		// Front
		1.0, 1.0, 1.0,    0.4, 0.1, 0.7,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    0.4, 0.1, 0.7,

		// Back
		1.0, 1.0, -1.0,    0.4, 0.1, 0.7,
		1.0, -1.0, -1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, -1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, -1.0,    0.4, 0.1, 0.7,

		// Bottom
		-1.0, -1.0, -1.0,   1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,     1.0, 0.0, 0.15,
		1.0, -1.0, -1.0,    1.0, 0.0, 0.15,

        // Pyramid
        // 0.0, 3.0, 0.0,    0.1, 0.5, 0.9,  // Top
        // 0.5, 2.0, 0.5,    0.4, 0.1, 0.7,  // Front Right
        // 0.5, 2.0, -0.5,   0.4, 0.1, 0.7,  // Back Right
        // -0.5, 2.0, -0.5,  0.4, 0.1, 0.7,  // Back Left
        // -0.5, 2.0, 0.5,   0.4, 0.1, 0.7,  // Front Left
    ]

    var indices = 
    [
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

        // Pyramid
        // 24, 25, 26, // Right
        // 24, 26, 27, // Back
        // 24, 27, 28, // Left
        // 24, 28, 25, // Front
        // 25, 27, 26, // Bottom
        // 28, 27, 25, // Bottom
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
        6 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(positionAttribLocation)

    var colorAttribLocation = gl.getAttribLocation(program, "vertColor")
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(colorAttribLocation)

    gl.useProgram(program)

    var worldMatUniformLocation = gl.getUniformLocation(program, "worldMat")
    var viewMatUniformLocation = gl.getUniformLocation(program, "viewMat")
    var projectionMatUniformLocation = gl.getUniformLocation(program, "projectionMat")

    var worldMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)

    identity(worldMatrix)
    // lookAt(viewMatrix, [0,20,-50], [0,5,0], [0,1,0]) // first is Eye -> cam pos; second is Look -> point to look at; third is Up -> vertical from cam
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)

    gl.uniformMatrix4fv(worldMatUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(viewMatUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(projectionMatUniformLocation, gl.FALSE, projectionMatrix)

    var xRotationMatrix = new Float32Array(16)
    var yRotationMatrix = new Float32Array(16)
    
    var identityMatrix = new Float32Array(16)
    identity(identityMatrix)

    function drawTower() {
        gl.clearColor(0.3, 0.3, 0.3, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            
        var angle = 0
    
        var translateVec3 = new Float32Array(3)
    
        var scaleVec3 = new Float32Array(3)
        scaleVec3[0] = 10
        scaleVec3[1] = 1
        scaleVec3[2] = 10
    
        for (var i = 0; i < 10; i++) {
            rotateY(yRotationMatrix, identityMatrix, angle)         // rotate rotationMatrix around y-axis
            multiply(worldMatrix, yRotationMatrix, identityMatrix)  // actually put the rotation into the worldMatrix
    
            translate(worldMatrix, worldMatrix, translateVec3)      // translate worldMatrix 
            
            scale(worldMatrix, worldMatrix, scaleVec3)              // scale worldMatrix to be smaller
            gl.uniformMatrix4fv(worldMatUniformLocation, gl.FALSE, worldMatrix)   // give new worldMatrix to vertexShader
        
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    
            angle += 30
    
            if (scaleVec3[0] > 1) {
                scaleVec3[0] -= 1
                scaleVec3[2] -= 1
            }
    
            translateVec3[1] += 2
    
        }
    }
        
    var camX = 0
    var camZ = 0

    function loop() {
        lookAt(viewMatrix, [Math.sin(camX) * 40, 40, Math.cos(camZ) * 40], [0,5,0], [0,1,0])
        gl.uniformMatrix4fv(viewMatUniformLocation, gl.FALSE, viewMatrix)

        drawTower()

        camX += 0.01
        camZ += 0.01

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
} 

window.onload = init