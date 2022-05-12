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

    var normalAttribLocation = gl.getAttribLocation(program, "normalMat")
    gl.vertexAttribPointer(
        normalAttribLocation,
        3,
        gl.Float,
        gl.FALSE,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(normalAttribLocation)

    gl.useProgram(program)

    gl.clearColor(0.2, 0.2, 0.2, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT)

    var worldMatUniformLocation = gl.getUniformLocation(program, "worldMat")
    var viewMatUniformLocation = gl.getUniformLocation(program, "viewMat")
    var projectionMatUniformLocation = gl.getUniformLocation(program, "projectionMat")
    var normalMatUniformLocation = gl.getUniformLocation(program, "normalMat")

    var worldMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)
    var modelViewMatrix = new Float32Array(16)
    var normalMatrix = new Float32Array(9)

    identity(worldMatrix)
    lookAt(viewMatrix, [10,10,40], [0,10,0], [0,1,0]) // first is Eye -> cam pos; second is Look -> point to look at; third is Up -> vertical from cam
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)

    multiply(modelViewMatrix, worldMatrix, viewMatrix) // TODO: right way around?
    
    normalMatrix[0] = modelViewMatrix[0]
    normalMatrix[1] = modelViewMatrix[1]
    normalMatrix[2] = modelViewMatrix[2]
    normalMatrix[3] = modelViewMatrix[4]
    normalMatrix[4] = modelViewMatrix[5]
    normalMatrix[5] = modelViewMatrix[6]
    normalMatrix[6] = modelViewMatrix[8]
    normalMatrix[7] = modelViewMatrix[9]
    normalMatrix[8] = modelViewMatrix[10]

    inverse3x3(normalMatrix, normalMatrix)
    transpose(normalMatrix, normalMatrix)

    // var test = new Float32Array(9)
    // test[0] = 1.0
    // test[1] = 1.0
    // test[2] = 0.0
    // test[3] = 2.0
    // test[4] = 0.0
    // test[5] = 1.0
    // test[6] = 1.0
    // test[7] = 1.0
    // test[8] = -1.0
    // inverse3x3(test, test)
    // console.log(test)

    gl.uniformMatrix4fv(worldMatUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(viewMatUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(projectionMatUniformLocation, gl.FALSE, projectionMatrix)
    gl.uniformMatrix3fv(normalMatUniformLocation, gl.FALSE, normalMatrix)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8) 

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

window.onload = init
