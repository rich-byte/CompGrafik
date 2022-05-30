async function init() {
    let vertexShaderText = `
        precision mediump float;

        attribute vec3 vertPos;
        attribute vec2 vertTexCoord;

        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;

        varying vec2 texCoord;

        void main(){
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);
            texCoord = vertTexCoord;
        }
    `

    let fragmentShaderText = `
        precision mediump float;

        varying vec2 texCoord;

        uniform sampler2D inTexture;

        void main() {
            // gl_FragColor = vec4(0,0.7,0,1);
            gl_FragColor = texture2D(inTexture, texCoord);
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

    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord')
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

    const modelViewLocation = gl.getUniformLocation(program, "modelViewMatrix")
    const projLocation = gl.getUniformLocation(program, "projMatrix")
    gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projectionMatrix)
    
    var yRotationMatrix = new Float32Array(16)
    var identityMatrix = new Float32Array(16)
    identity(identityMatrix)

    // texture setup
    var inTextureUniformLocation = gl.getUniformLocation(program, 'inTexture')
    gl.uniform1i(inTextureUniformLocation, 0)
    var texture = await loadTexture(gl, 'earth_day.png')

    gl.clearColor(0.2, 0.2, 0.2, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.drawArrays(gl.TRIANGLES, 0, earthObj.length / 8)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    
    var angle = 0

    function draw() {
        gl.clearColor(0.2, 0.2, 0.2, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        rotateY(yRotationMatrix, identityMatrix, angle)
        multiply(modelMatrix, yRotationMatrix, identityMatrix)
        multiply(modelViewMatrix, viewMatrix, modelMatrix)
        gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)

        angle += 0.003

        gl.drawArrays(gl.TRIANGLES, 0, earthObj.length / 8)

        requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
}

window.onload = init