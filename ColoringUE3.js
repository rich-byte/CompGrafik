'use strict';

// attributes are input variables
// varying are ouput var
const vertexShaderText = 
	`
	precision mediump float;

	attribute vec2 vertPos;

	attribute float vertValue; // position value between 0 and 1
	varying float vertValueFrag;

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
	
    vec3 hsvToRgb(vec3 color) {
        vec3 rgbColor;
        float max = color[0];
        float min = color[0];
        for (int i = 1; i <= 2; i++) {
            if (color[i] > max) {
                max = color[i];
            } else if (color[i] < min) {
                min = color[i];
            }
        }

        // H
        if (max == color[0]) {
            hsvColor[0] = 60.0*(0.0 + (color[1] + color[2])/(max - min));
        } else if (color[1] == max) {
            hsvColor[0] = 60.0*(2.0 + (color[2] - color[0])/(max - min));
        } else if (color[2] == max) {
            hsvColor[0] = 60.0*(4.0 + (color[0] - color[1])/(max - min));
        }

        if (hsvColor[0] < 0.0) {
            hsvColor[0] += 360.0;
        } 

        // hsvColor[0] = hsvColor[0]/360.0;

        // S
        if (max == 0.0) {
            hsvColor[1] = 0.0;
        } else {
            hsvColor[1] = (max - min)/max;
        }

        // V
        hsvColor[2] = max;

        return hsvColor;
    }

	void main()
	{
        vec3 hsvColor = rgbToHsv(fragColor1);

        // gl_FragColor = vec4(step(0.5, mix(fragColor1, fragColor2, vertValueFrag)), 1.0);                       // split color
        // gl_FragColor = vec4(smoothstep(0.1, 0.5, mix(fragColor1, fragColor2, vertValueFrag)), 1.0);            // smoothstep
		// gl_FragColor = vec4(mix(fragColor1, fragColor2, sin(vertValueFrag * 3.1416 * 10.0) / 0.001), 1.0);     // Banden hart
        // gl_FragColor = vec4(mix(fragColor1, fragColor2, sin(vertValueFrag * 3.1416 * 4.0) / 2.0 + 0.5), 1.0);  // Banden smooth 

        gl_FragColor = vec4(hsvColor[0], vertValueFrag*hsvColor[1], hsvColor[2], 1);                         // smooth fade
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
		
	const vertValueAttributeLocation = gl.getAttribLocation(program, "vertValue")
	gl.vertexAttribPointer(
		vertValueAttributeLocation,
		1, 
		gl.FLOAT, 
		gl.FALSE, 
		6 * Float32Array.BYTES_PER_ELEMENT,
		5 * Float32Array.BYTES_PER_ELEMENT)
	gl.enableVertexAttribArray(vertValueAttributeLocation)

	
	function loop() {
		gl.drawArrays(gl.TRIANGLES, 0, 24)

		// set actual color
		const fragColor1Location = gl.getUniformLocation(program, "fragColor1")
		gl.uniform3f(fragColor1Location, 1, 0, 0)

		const fragColor2Location = gl.getUniformLocation(program, "fragColor2")
		gl.uniform3f(fragColor2Location, 1, 0, 0)

		requestAnimationFrame(loop)
	}
	
	requestAnimationFrame(loop)
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

window.onload = init



































