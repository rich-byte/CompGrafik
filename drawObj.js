'use strict'

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

    const vertices = await getDataFromObj("http://127.0.0.1:5500/helmet.obj")
    const vbo = vboSetup(gl, vertices)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

    var positionAttribLocation = gl.getAttribLocation(program, "vertPos")
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        8 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(positionAttribLocation)

    var colorAttribLocation = gl.getAttribLocation(program, "vertColor")
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(colorAttribLocation)

    gl.useProgram(program)

    gl.clearColor(0.2, 0.2, 0.2, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT)

    var worldMatUniformLocation = gl.getUniformLocation(program, "worldMat")
    var viewMatUniformLocation = gl.getUniformLocation(program, "viewMat")
    var projectionMatUniformLocation = gl.getUniformLocation(program, "projectionMat")

    var worldMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)

    identity(worldMatrix)
    lookAt(viewMatrix, [10,10,40], [0,10,0], [0,1,0]) // first is Eye -> cam pos; second is Look -> point to look at; third is Up -> vertical from cam
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)

    gl.uniformMatrix4fv(worldMatUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(viewMatUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(projectionMatUniformLocation, gl.FALSE, projectionMatrix)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8) 

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

window.onload = init
