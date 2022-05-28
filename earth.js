async function init() {
    let vertexShaderText = `
        precision mediump float;

        attribute vec3 vertPos;

        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;

        void main(){
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);
        }
    `

    let fragmentShaderText = `
        void main() {
            gl_FragColor = vec4(0,0.7,0,1);
        }
    `
    const canvas = document.getElementById("cg1")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl")

    const vertexShader = initVertexShader(gl, vertexShaderText)
    const fragmentShader = initFragShader(gl, fragmentShaderText)
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    const earthObj = await getDataFromObj("http://127.0.0.1:5500/earth.obj")
    
    const vbo = vboSetup(gl, earthObj)
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

    gl.useProgram(program)
        
    var modelMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)
    var modelViewMatrix = new Float32Array(16)

    identity(modelMatrix)
    lookAt(viewMatrix, [0,0,-5], [0,0,0], [0,1,0])
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)
    multiply(modelViewMatrix, viewMatrix, modelMatrix)

    const modelViewLocation = gl.getUniformLocation(program, "modelViewMatrix")
    const projLocation = gl.getUniformLocation(program, "projMatrix")
    gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projectionMatrix)
    
    var yRotationMatrix = new Float32Array(16)
    var identityMatrix = new Float32Array(16)
    identity(identityMatrix)


    gl.clearColor(0.2, 0.2, 0.2, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.drawArrays(gl.TRIANGLES, 0, earthObj.length / 8)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    
    var angle = 0
    var camX = 0
    var camZ = 0

    function draw() {
        // lookAt(viewMatrix, [Math.sin(camX) * 40, 40, Math.cos(camZ) * 40], [0,0,0], [0,1,0])

        gl.clearColor(0.2, 0.2, 0.2, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // rotateY(modelViewMatrix, modelViewMatrix, angle)

        rotateY(yRotationMatrix, identityMatrix, angle)
        multiply(modelMatrix, yRotationMatrix, identityMatrix)
        multiply(modelViewMatrix, viewMatrix, modelMatrix)
        gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)

        angle += 0.01
        camX += 0.01
        camZ += 0.01

        gl.drawArrays(gl.TRIANGLES, 0, earthObj.length / 8)

        requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
}

window.onload = init