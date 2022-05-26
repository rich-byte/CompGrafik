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
    // const vertices = await getDataFromObj("http://127.0.0.1:5500/teapot(1).obj")

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

    var normalAttribLocation = gl.getAttribLocation(program, "v_Normal")
    gl.vertexAttribPointer(
        normalAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(normalAttribLocation)

    gl.useProgram(program)

    gl.clearColor(0.2, 0.2, 0.2, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT)

    // fragment uniforms for Material and Light
    var lightPositonUniformLocation = gl.getUniformLocation(program, "lightPosition");
    var lightPositon = new Float32Array(4);
    lightPositon[0] = 0.0;
    lightPositon[1] = 5.0;
    lightPositon[2] = 0.0;
    lightPositon[3] = 1.0;

    var lightAmbientUniformLocation = gl.getUniformLocation(program, "lightAmbient");
    var lightAmbient = new Float32Array(4)
    lightAmbient[0] = 0.7;
    lightAmbient[1] = 0.7;
    lightAmbient[2] = 0.8;
    lightAmbient[3] = 1.0;

    var lightDiffuseUniformLocation = gl.getUniformLocation(program, "lightDiffuse");
    var lightDiffuse = new Float32Array(4)
    lightDiffuse[0] = 1.0;
    lightDiffuse[1] = 1.0;
    lightDiffuse[2] = 1.0;
    lightDiffuse[3] = 1.0;

    var lightSpecularUniformLocation = gl.getUniformLocation(program, "lightSpecular");
    var lightSpecular = new Float32Array(4)
    lightSpecular[0] = 1.0;
    lightSpecular[1] = 1.0;
    lightSpecular[2] = 1.0;
    lightSpecular[3] = 1.0;

    var lightHalfVectorUniformLocation = gl.getUniformLocation(program, "lightHalfVector");
    var lightHalfVector = new Float32Array(3)
    lightHalfVector[0] = 0.0;
    lightHalfVector[1] = 0.0;
    lightHalfVector[2] = 0.0;

    var materialEmissionUniformLocation = gl.getUniformLocation(program, "materialEmission");
    var materialEmission = new Float32Array(4)
    materialEmission[0] = 0.0;
    materialEmission[1] = 0.0;
    materialEmission[2] = 0.0;
    materialEmission[3] = 0.0;

    var materialAmbientUniformLocation = gl.getUniformLocation(program, "materialAmbient");
    var materialAmbient = new Float32Array(4)
    materialAmbient[0] = 1.0;
    materialAmbient[1] = 1.0;
    materialAmbient[2] = 1.0;
    materialAmbient[3] = 1.0;

    var materialDiffuseUniformLocation = gl.getUniformLocation(program, "materialDiffuse");
    var materialDiffuse = new Float32Array(4)
    materialDiffuse[0] = 0.3;
    materialDiffuse[1] = 0.3;
    materialDiffuse[2] = 0.3;
    materialDiffuse[3] = 1.0;

    var materialSpecularUniformLocation = gl.getUniformLocation(program, "materialSpecular");
    var materialSpecular = new Float32Array(4)
    materialSpecular[0] = 0.8;
    materialSpecular[1] = 0.8;
    materialSpecular[2] = 0.8;
    materialSpecular[3] = 1.0;

    var materialShininessUniformLocation = gl.getUniformLocation(program, "materialShininess");
    var materialShininess = 100.0

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

    multiply(modelViewMatrix, worldMatrix, viewMatrix) 
    
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

    gl.uniformMatrix4fv(worldMatUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(viewMatUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(projectionMatUniformLocation, gl.FALSE, projectionMatrix)
    gl.uniformMatrix3fv(normalMatUniformLocation, gl.FALSE, normalMatrix)
    gl.uniform4fv(lightPositonUniformLocation, lightPositon)
    gl.uniform4fv(lightAmbientUniformLocation, lightAmbient)
    gl.uniform4fv(lightDiffuseUniformLocation,lightDiffuse)
    gl.uniform4fv(lightSpecularUniformLocation, lightSpecular)
    gl.uniform3fv(lightHalfVectorUniformLocation, lightHalfVector)
    gl.uniform4fv(materialEmissionUniformLocation, materialEmission)
    gl.uniform4fv(materialAmbientUniformLocation, materialAmbient)
    gl.uniform4fv(materialDiffuseUniformLocation, materialDiffuse)
    gl.uniform4fv(materialSpecularUniformLocation, materialSpecular)
    gl.uniform1f(materialShininessUniformLocation, materialShininess)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8) 

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

window.onload = init
