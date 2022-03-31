'use strict';

const vertexShaderText = 
    `
    precision mediump float;
    attribute vec2 vertPos;

    void main() {
        gl_Position = vec4(vertPos, 0, 1.0);
    }
    `

const fragmentShaderText = 
    `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(0, 0, 0, 1.0);
    }
    `

function init() {
    const canvas = document.getElementById("cg1")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl")

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexShaderText)
    gl.compileShader(vertexShader)
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("Error compiling vertexShader: ", gl.getShaderInfoLog(vertexShader))
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragShader, fragmentShaderText)
    gl.compileShader(fragShader)
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        console.error("Error compiling fragShader: ", gl.getShaderInfoLog(fragShader))
    }

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    const vertices = generateCircleVertices(0.0, 0.0, 0.5, 0.1)

    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    gl.clearColor(0.0, 1.0, 0.8, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

    const positionAttributeLocation = gl.getAttribLocation(program, "vertPos")
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(positionAttributeLocation)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

function generateCircleVertices(midX, midY, r, step) {
    const arr = [midX, midY]

    for (let i = 0; i <= 2*Math.PI; i += step) {
        let x = r * Math.cos(i)
        let y = r * Math.sin(i)

        arr.push(x)
        arr.push(y)
    }

    // push the first value again to finish the circle
    arr.push(arr[2])
    arr.push(arr[3])

    return arr
}

window.onload = init