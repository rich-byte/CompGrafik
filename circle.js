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

    // const vertices = generateCircleVertices(0.0, 0.0, 0.5, 0.1)

    // const vertices = generateHoleCircleVertices(0.1, 0.5, 0.1)

    // const vbo = vboSetup(gl, vertices)

    // gl.clearColor(0.0, 1.0, 0.8, 1.0)
    // gl.clear(gl.COLOR_BUFFER_BIT)

    // gl.useProgram(program)
    // gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    
    // feedDataToShader(gl, program, "vertPos")
    
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2)

    var circleDefinition = 1
    var step = 0.002

    function loop() {
        const vertices = generateHoleCircleVertices(0.1, 0.5, circleDefinition)
        const vbo = vboSetup(gl, vertices)

        gl.clearColor(0.0, 1.0, 0.8, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        feedDataToShader(gl, program, "vertPos")

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2)

        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        
        // higher def and slow down towards end 
        if (circleDefinition > 0.1) {
            circleDefinition -= step
            if (step > 0.0004 && circleDefinition < 0.5) {
                step -= 0.00001
            }
            requestAnimationFrame(loop)
        }
    }

    requestAnimationFrame(loop)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

function vboSetup(context, vertices) {
    let vbo = context.createBuffer()
    context.bindBuffer(context.ARRAY_BUFFER, vbo)
    context.bufferData(context.ARRAY_BUFFER,
        new Float32Array(vertices),
        context.STATIC_DRAW)
    context.bindBuffer(context.ARRAY_BUFFER, null)
    return vbo
}

function feedDataToShader(context, program, shaderAttrName) {
    const positionAttributeLocation = context.getAttribLocation(program, shaderAttrName)
    context.vertexAttribPointer(
        positionAttributeLocation,
        2,
        context.FLOAT,
        context.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    )
    context.enableVertexAttribArray(positionAttributeLocation)
}


function generateHoleCircleVertices(rInner, rOuter, step) {
    const arr = []

    for (let i = 0; i <= 2*Math.PI; i += step) {
        let x = rInner * Math.cos(i)
        let y = rInner * Math.sin(i)
        
        arr.push(x, y)
        
        x = rOuter * Math.cos(i)
        y = rOuter * Math.sin(i)
        
        arr.push(x, y)
    }
    
    arr.push(arr[0], arr[1], arr[2], arr[3])
    
    return arr
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