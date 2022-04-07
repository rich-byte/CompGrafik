'use strict';

var vertexShaderText = 
[
    `
    precision mediump float;

    attribute vec3 vertPos;
    attribute vec3 vertColor;
    varying vec3 fragColor;

    uniform mat4 worldMat;
    uniform mat4 viewMat;
    uniform mat4 projectionMat;

    void main() {
        fragColor = vertColor;
        gl_Position = projectionMat * viewMat * worldMat * vec4(vertPos, 1.0);
    }
    `
]

var fragmentShaderText = 
[
    `
    precision mediump float;
	varying vec3 fragColor;
	
	void main()
	{
		gl_FragColor = vec4(fragColor, 1.0); 
	}
    `
]

function init() {
    const canvas = document.getElementById("cg1")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl") 

    // shader instantiation
	const vertexShader = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(vertexShader, vertexShaderText)
	gl.compileShader(vertexShader)
	
	const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
	gl.shaderSource(fragShader, fragmentShaderText)
	gl.compileShader(fragShader)
    
	// check for compile errors (not automatic)
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) 
	{
        console.error("Error compiling vertexShader: ", gl.getShaderInfoLog(vertexShader))
	}
	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
	{
        console.error("Error compiling fragShader: ", gl.getShaderInfoLog(fragShader))
	}
	
    const program = gl.createProgram()
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragShader)
	gl.linkProgram(program)

    gl.enable(gl.DEPTH_TEST)
    // gl.enable(gl.CULL_FACE)
    // gl.frontFace(gl.CCW)
    // gl.cullFace(gl.BACK)
	
    // x, y, z, R, G, B
	const vertices = 
    [
        // Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0
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
		22, 20, 23
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

    glMatrix.mat4.identity(worldMatrix)
    glMatrix.mat4.lookAt(viewMatrix, [0,0,-8], [0,0,0], [0,1,0])
    glMatrix.mat4.perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)


    gl.uniformMatrix4fv(worldMatUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(viewMatUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(projectionMatUniformLocation, gl.FALSE, projectionMatrix)

    var xRotationMatrix = new Float32Array(16)
    var yRotationMatrix = new Float32Array(16)
    
    var identityMatrix = new Float32Array(16)
    glMatrix.mat4.identity(identityMatrix)
        
    var angle = 0
    
    function loop() {
        console.log("hallo")
        angle = performance.now() / 1000 / 6 * 2 * Math.PI
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0,1,0])
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1,0,0])

        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix)
        gl.uniformMatrix4fv(worldMatUniformLocation, gl.FALSE, worldMatrix)

        gl.clearColor(0.1, 0.1, 0.1, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)       

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
} 

window.onload = init