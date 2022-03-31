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

    const vertices = 
    [
        // bottom
        -0.5, -0.3,
        -0.5, -0.5,
         0.5, -0.5,
         0.5, -0.3,

         // left H
         -0.5, -0.1,
         -0.5, 0.7,
         -0.3, 0.7,

         // uppder mid H
         -0.3, 0.45,
          0.3, 0.45,

          // right H
          0.3, 0.7,
          0.5, 0.7,
          0.5, -0.1,
          0.3, -0.1,

        // lower mid
         0.3, 0.25,
        -0.3, 0.25,

        // left H bot right
        -0.3, -0.1
    ]

    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
        
    
    const indices = 
    [
        // CULL_FACE: only counter clockwise is being drawn. Start CCW, next triangle will be flipped (always CW if attached to previous one)
        1, 2, 0, 3, 3, 5, 5, 4, 6, 15, 15, 7, 7, 14, 8, 13, 13, 9, 9, 12, 10, 11
    ]
    const ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)

    gl.enable(gl.CULL_FACE)

    gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, gl.UNSIGNED_SHORT.BYTES_PER_ELEMENT)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
}

window.onload = init