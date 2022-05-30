async function init() {
    let vertexShaderText = `
        precision mediump float;

        attribute vec3 vertPos;
        attribute vec2 vertTex;

        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;

        varying vec2 textureCoord;

        void main(){
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);
            textureCoord = vertTex;
        }
    `

    let fragmentShaderText = `
        precision mediump float;

        varying vec2 textureCoord;

        uniform sampler2D uSampler;
        void main() {
            gl_FragColor = texture2D(uSampler, textureCoord);
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

    const texture = await loadTexture(gl, "earth_day.png")
    const textureCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
    
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

    var texCoordAttribLocation = gl.getAttribLocation(program, "vertTex")
    gl.vertexAttribPointer(
        texCoordAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        8 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(texCoordAttribLocation)

    gl.useProgram(program)
        
    var modelMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)
    var modelViewMatrix = new Float32Array(16)

    identity(modelMatrix)
    lookAt(viewMatrix, [0,0,-5], [0,0,0], [0,1,0])
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)
    multiply(modelViewMatrix, viewMatrix, modelMatrix)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    const modelViewLocation = gl.getUniformLocation(program, "modelViewMatrix")
    const projLocation = gl.getUniformLocation(program, "projMatrix")
    const samplerLocation = gl.getUniformLocation(program, "uSampler")
    gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projectionMatrix)
    gl.uniform1i(samplerLocation, 0)
    
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