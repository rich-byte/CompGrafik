'use strict';

// attributes are input variables
// varying are ouput var
const vertexShaderText = 
	`
	precision mediump float;
	attribute vec2 vertPos;
	attribute vec3 vertColor;
	varying vec3 fragColor;
	
	void main()
	{
		fragColor = vertColor;
		gl_Position = vec4(vertPos, 0, 1.0);
	}
	`

const fragmentShaderText = 
	`
	precision mediump float;
	varying vec3 fragColor;
	
	void main()
	{
		gl_FragColor = vec4(fragColor, 1.0);
	}
	`

function init()
{
	console.log("hallo")
	const canvas = document.getElementById("cg1")
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
	
	const program = gl.createProgram()
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragShader)
	gl.linkProgram(program)
	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
	{
		console.error("Error compiling fragShader: ", gl.getShaderInfoLog(fragShader))
	}
	
	// x, y, r, g ,b
	const triangleVertices = 
		[
		1.0, 0.0, 0.5, 0.5, 0.5,
		0.0, 1.0, 0.5, 0.5, 0.5,
		0.0, -0.5, 0.0, 0.5, 0.5,
		
		-1.0, 0.0, 0.0, 0.35, 0.35,
		0.0, 1.0, 0.0, 0.35, 0.35,
		0.0, -0.5, 0.0, 0.5, 0.5,
		
		0.0, 0.5, 1.0, 0.5, 0.5,
		-0.5, -0.5, 1.0, 0.5, 0.5,
		0.5, -0.5, 1.0, 0.5, 0.5,
		]
	const triangleVBO = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO) // bind buffer to set as default
	gl.bufferData(gl.ARRAY_BUFFER, 
		new Float32Array(triangleVertices), // set data type
		gl.STATIC_DRAW)
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null) // unbind buffer
	
	gl.clearColor(0.0, 1.0, 0.8, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT)
	
	gl.useProgram(program)
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO)
	
	const positionAttributeLocation = gl.getAttribLocation(program, "vertPos")
	gl.vertexAttribPointer(
	positionAttributeLocation,
	2, 
	gl.FLOAT, 
	gl.FALSE, 
	5 * Float32Array.BYTES_PER_ELEMENT,
	0 * Float32Array.BYTES_PER_ELEMENT)
	gl.enableVertexAttribArray(positionAttributeLocation)
		
	const colorAttributeLocation = gl.getAttribLocation(program, "vertColor")
	gl.vertexAttribPointer(
	colorAttributeLocation,
	3,
	gl.FLOAT,
	gl.FALSE,
	5 * Float32Array.BYTES_PER_ELEMENT,
	2 * Float32Array.BYTES_PER_ELEMENT,
	)
	gl.enableVertexAttribArray(colorAttributeLocation)
	
	gl.drawArrays(gl.TRIANGLES, 0, 9)
	gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

window.onload = init





















