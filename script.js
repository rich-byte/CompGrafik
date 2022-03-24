'use strict';

// attributes are input variables
// varying are ouput var
const vertexShaderText = 
	`
	precision mediump float;

	attribute vec2 vertPos;
	uniform vec2 positionChange; // disabled

	attribute float vertValue; // position value between 0 and 1
	varying float vertValueFrag;

	//attribute vec3 vertColor; // unused at the moment
	//varying vec3 fragColor;
	//uniform vec3 color;
	
	void main()
	{
		//fragColor = color;
		vertValueFrag = vertValue;
		
		vec2 newPos = vertPos; //+ positionChange;
		gl_Position = vec4(newPos, 0, 1.0);
	}
	`

const fragmentShaderText = 
	`
	precision mediump float;
	varying float vertValueFrag;
	uniform vec3 fragColor1;
	uniform vec3 fragColor2;
	
	void main()
	{
		gl_FragColor = vec4(mix(fragColor1, fragColor2, sin(vertValueFrag * 3.1416 * 10.0) / 0.001), 1.0); 
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
	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
	{
		console.error("Error compiling fragShader: ", gl.getShaderInfoLog(fragShader))
	}
	
	const program = gl.createProgram()
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragShader)
	gl.linkProgram(program)
	
	// x, y, r, g ,b
	const triangleVertices = 
		[
		// left quad
		-0.5, -0.1, 1.0, 0.5, 0.5, 0,
		-0.5, 0.7, 1.0, 0.5, 0.5, 0,
		-0.3, -0.1, 1.0, 0.5, 0.5, -0.3/0.5,
		
		-0.3, 0.7, 1.0, 0.5, 0.5, -0.3/0.5,
		-0.3, -0.1, 1.0, 0.5, 0.5, -0.3/0.5,
		-0.5, 0.7, 1.0, 0.5, 0.5, 0,
		
		// right quad
		0.5, -0.1, 1.0, 0.5, 0.5, 1,
		0.5, 0.7, 1.0, 0.5, 0.5, 1,
		0.3, -0.1, 1.0, 0.5, 0.5, 0.3/0.5,
		
		0.3, 0.7, 1.0, 0.5, 0.5, 0.3/0.5,
		0.3, -0.1, 1.0, 0.5, 0.5, 0.3/0.5,
		0.5, 0.7, 1.0, 0.5, 0.5, 1,
		
		// mid quad
		-0.5, 0.2, 1.0, 0.5, 0.5, 0,
		-0.5, 0.4, 1.0, 0.5, 0.5, 0,
		0.5, 0.4, 1.0, 0.5, 0.5, 1,
		
		0.5, 0.2, 1.0, 0.5, 0.5, 1,
		-0.5, 0.2, 1.0, 0.5, 0.5, 0,
		0.5, 0.4, 1.0, 0.5, 0.5, 1,
				
		// bottom quad
		-0.5, -0.3, 1.0, 0.5, 0.5, 0,
		-0.5, -0.5, 1.0, 0.5, 0.5, 0,
		0.5, -0.5, 1.0, 0.5, 0.5, 1,
		
		0.5, -0.3, 1.0, 0.5, 0.5, 1,
		-0.5, -0.3, 1.0, 0.5, 0.5, 0,
		0.5, -0.5, 1.0, 0.5, 0.5, 1
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
	6 * Float32Array.BYTES_PER_ELEMENT,
	0 * Float32Array.BYTES_PER_ELEMENT)
	gl.enableVertexAttribArray(positionAttributeLocation)
		
	// const colorAttributeLocation = gl.getAttribLocation(program, "vertColor")
	// gl.vertexAttribPointer(
	// colorAttributeLocation,
	// 3,
	// gl.FLOAT,
	// gl.FALSE,
	// 6 * Float32Array.BYTES_PER_ELEMENT,
	// 2 * Float32Array.BYTES_PER_ELEMENT,
	// )
	// gl.enableVertexAttribArray(colorAttributeLocation)

	const vertValueAttributeLocation = gl.getAttribLocation(program, "vertValue")
	gl.vertexAttribPointer(
		vertValueAttributeLocation,
		1, 
		gl.FLOAT, 
		gl.FALSE, 
		6 * Float32Array.BYTES_PER_ELEMENT,
		5 * Float32Array.BYTES_PER_ELEMENT)
	gl.enableVertexAttribArray(vertValueAttributeLocation)

	
	var redValue = 0
	var greenValue = 0
	var blueValue = 0
	var isIncrementingColor = true
	
	var xChange = 0
	var yChange = 0
	var xStep = 0.01
	var yStep = 0.01
	var xMax = 0.5 // 0.5 is highest starting x so to stay in bounds only count to 0.5
	var yMax = 0.3 // 0.7 is highest starting y so to stay in bounds only count to 0.3
	var isIncrementingX = true
	var isIncrementingY = true
	
	function loop() {
		gl.drawArrays(gl.TRIANGLES, 0, 24)
		
		// set shader color
		// const colorLocation = gl.getUniformLocation(program, "color")
		// gl.uniform3f(colorLocation, redValue, greenValue, blueValue, 1)

		// set actual color
		const fragColor1Location = gl.getUniformLocation(program, "fragColor1")
		gl.uniform3f(fragColor1Location, 0, 1, 0)

		const fragColor2Location = gl.getUniformLocation(program, "fragColor2")
		gl.uniform3f(fragColor2Location, 1, 0, 0)
		
		// update color values and eventually reverse counting 
		// if (isIncrementingColor) {
		// 	redValue += 0.01
		// 	greenValue += 0.01
		// 	blueValue += 0.01
			
		// 	if (redValue >= 1) {
		// 		isIncrementingColor = false
		// 	}		
		// } else if (!isIncrementingColor) {
		// 	redValue -= 0.01
		// 	greenValue -= 0.01
		// 	blueValue -= 0.01
			
		// 	if (redValue <= 0) {	
		// 		isIncrementingColor = true
		// 	}
		// }
		
		// connect positionChange with variables in code
		const positionChangeLocation = gl.getUniformLocation(program, "positionChange")
		gl.uniform2f(positionChangeLocation, xChange, yChange)

		// bounce left and right
		if (isIncrementingX) {
			xChange += xStep

			if (xChange >= xMax) {
				isIncrementingX = false
			}
		} else if (!isIncrementingX) {
			xChange -= xStep

			if (xChange <= -xMax) {
				isIncrementingX = true
			}
		}

		// bounce up and down
		if (isIncrementingY) {
			yChange += yStep

			if (yChange >= yMax) {
				isIncrementingY = false
			}
		} else if (!isIncrementingY) {
			yChange -= yStep

			if (yChange <= -yMax) {
				isIncrementingY = true
			}
		}

		requestAnimationFrame(loop)
	}
	
	requestAnimationFrame(loop)
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

window.onload = init



































