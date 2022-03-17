'use strict';

// attributes are input variables
// varying are ouput var
const vertexShaderText = 
	`
	precision mediump float;
	attribute vec2 vertPos;
	attribute vec3 vertColor; // unused at the moment
	varying vec3 fragColor;
	uniform vec3 color;
	
	void main()
	{
		fragColor = color;
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
		// left quad
		-0.5, -0.1, 1.0, 0.5, 0.5,
		-0.5, 0.7, 1.0, 0.5, 0.5,
		-0.3, -0.1, 1.0, 0.5, 0.5,
		
		-0.3, 0.7, 1.0, 0.5, 0.5,
		-0.3, -0.1, 1.0, 0.5, 0.5,
		-0.5, 0.7, 1.0, 0.5, 0.5,
		
		// right quad
		0.5, -0.1, 1.0, 0.5, 0.5,
		0.5, 0.7, 1.0, 0.5, 0.5,
		0.3, -0.1, 1.0, 0.5, 0.5,
		
		0.3, 0.7, 1.0, 0.5, 0.5,
		0.3, -0.1, 1.0, 0.5, 0.5,
		0.5, 0.7, 1.0, 0.5, 0.5,
		
		// mid quad
		-0.5, 0.2, 1.0, 0.5, 0.5,
		-0.5, 0.4, 1.0, 0.5, 0.5,
		0.5, 0.4, 1.0, 0.5, 0.5,
		
		0.5, 0.2, 1.0, 0.5, 0.5,
		-0.5, 0.2, 1.0, 0.5, 0.5,
		0.5, 0.4, 1.0, 0.5, 0.5,	
				
		// bottom quad
		-0.5, -0.3, 1.0, 0.5, 0.5,
		-0.5, -0.5, 1.0, 0.5, 0.5,
		0.5, -0.5, 1.0, 0.5, 0.5,
		
		0.5, -0.3, 1.0, 0.5, 0.5,
		-0.5, -0.3, 1.0, 0.5, 0.5,
		0.5, -0.5, 1.0, 0.5, 0.5
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
	
	var redValue = 0
	var greenValue = 0
	var blueValue = 0
	var isIncrementing = true
	
	function loop() {
		gl.drawArrays(gl.TRIANGLES, 0, 24)
		
		// set shader color
		const colorLocation = gl.getUniformLocation(program, "color")
		gl.uniform3f(colorLocation, redValue, greenValue, blueValue, 1)
		
		// update color values and eventually reverse counting 
		if (isIncrementing) {
			redValue += 0.01
			greenValue += 0.01
			blueValue += 0.01
			
			if (redValue >= 1) {
				isIncrementing = false
			}		
		} else if (!isIncrementing) {
			redValue -= 0.01
			greenValue -= 0.01
			blueValue -= 0.01
			
			if (redValue <= 0) {	
				isIncrementing = true
			}
		}
		
		requestAnimationFrame(loop)
	}
	
	requestAnimationFrame(loop)
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

window.onload = init



































