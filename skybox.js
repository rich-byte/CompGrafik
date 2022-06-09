async function init() {
    let vertexShaderText = `
        precision mediump float;
        attribute vec3 vertPos;

        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;

        varying vec3 position;

        void main(){
            vec3 vPos = (modelViewMatrix * vec4(vertPos, 0.0)).xyz;
            gl_Position = projMatrix * vec4(vPos, 1.0);
            position = vertPos;
        }
    `

    let fragmentShaderText = `
        precision mediump float;
        
        varying vec3 position;
        uniform samplerCube texture;

        void main() {
            gl_FragColor = textureCube(texture, position);
        }
    `

    let objVertexShaderText = `
        precision mediump float;

        attribute vec3 vertPos;
        attribute vec3 vertNormal;

        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;
        uniform vec3 reflectionVec;

        varying vec3 Normal;
        varying vec3 fragReflectionVec;

        void main() {
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);

            Normal = vertNormal;
            fragReflectionVec = reflectionVec;
        }
    `

    let objFragmentShaderText = `
        precision mediump float;

        uniform samplerCube skyTexture;
        varying vec3 Normal;
        varying vec3 fragReflectionVec;

        void main() {
            vec3 N = normalize(Normal);
            float skalar = dot(fragReflectionVec, N);
            if (skalar < 0.0) {
                skalar = skalar * -1.0;
            }
            vec3 texCoords = N * skalar;
            gl_FragColor = textureCube(skyTexture, texCoords);
        }
    `

    const canvas = document.getElementById("cg1")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl")

    // program for skybox
    const vertexShader = initVertexShader(gl, vertexShaderText)
    const fragmentShader = initFragShader(gl, fragmentShaderText)
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)

    const vertices = [
        // pos(x,y,z)
        // Top
		-1.0, 1.0, -1.0, 
		-1.0, 1.0, 1.0,  
		1.0, 1.0, 1.0,   
		1.0, 1.0, -1.0,  

		// Left
		-1.0, 1.0, 1.0,  
		-1.0, -1.0, 1.0, 
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0, 

		// Right
		1.0, 1.0, 1.0,   
		1.0, -1.0, 1.0,  
		1.0, -1.0, -1.0, 
		1.0, 1.0, -1.0,  

		// Front
		1.0, 1.0, 1.0,   
		1.0, -1.0, 1.0,  
		-1.0, -1.0, 1.0, 
		-1.0, 1.0, 1.0,  

		// Back
		1.0, 1.0, -1.0,  
		1.0, -1.0, -1.0, 
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0, 

		// Bottom
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0, 
		1.0, -1.0, 1.0,  
		1.0, -1.0, -1.0, 
    ]

    var indices = [
        // Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

        // Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23,
    ]

    const vbo = vboSetup(gl, vertices)
    const ibo = iboSetup(gl, indices)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)

    var positionAttribLocation = gl.getAttribLocation(program, "vertPos")
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(positionAttribLocation)

    var modelMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projectionMatrix = new Float32Array(16)
    var modelViewMatrix = new Float32Array(16)

    identity(modelMatrix)
    lookAt(viewMatrix, [10,10,40], [0,10,0], [0,1,0])
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)
    multiply(modelViewMatrix, viewMatrix, modelMatrix)

    const modelViewLocation = gl.getUniformLocation(program, "modelViewMatrix")
    const projLocation = gl.getUniformLocation(program, "projMatrix")
    gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projectionMatrix)

    var yRotationMatrix = new Float32Array(16)
    var identityMatrix = new Float32Array(16)
    identity(identityMatrix)

    // texture cubemap
    const textureUniformLocation = gl.getUniformLocation(program, 'texture')
    gl.uniform1i(textureUniformLocation, 0)
    var texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
    var leftTexture = await loadTexture(gl, 'skybox/right.jpg', gl.TEXTURE_CUBE_MAP_POSITIVE_X)
    var rightTexture = await loadTexture(gl, 'skybox/left.jpg', gl.TEXTURE_CUBE_MAP_NEGATIVE_X)
    var topTexture = await loadTexture(gl, 'skybox/top.jpg', gl.TEXTURE_CUBE_MAP_POSITIVE_Y)
    var botTexture = await loadTexture(gl, 'skybox/bottom.jpg', gl.TEXTURE_CUBE_MAP_NEGATIVE_Y)
    var frontTexture = await loadTexture(gl, "skybox/front.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z)
    var backTexture = await loadTexture(gl, 'skybox/back.jpg', gl.TEXTURE_CUBE_MAP_NEGATIVE_Z)

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

    // program for objects in scene
    const objVertexShader = initVertexShader(gl, objVertexShaderText)
    const objFragmentShader = initFragShader(gl, objFragmentShaderText)
    const objProgram = gl.createProgram()
    gl.attachShader(objProgram, objVertexShader)
    gl.attachShader(objProgram, objFragmentShader)
    gl.linkProgram(objProgram)
    gl.useProgram(objProgram)

    const obj = await getDataFromObj("http://127.0.0.1:5500/helmet.obj")
    const objVbo = vboSetup(gl, obj)
    gl.bindBuffer(gl.ARRAY_BUFFER, objVbo)
    
    // assumes (0,0,1,0) as z-vector 
    var dirToCam = new Float32Array(3)
    var viewMatrix3x3 = new Float32Array(9)
    viewMatrix3x3[0] = viewMatrix[0]
    viewMatrix3x3[1] = viewMatrix[1]
    viewMatrix3x3[2] = viewMatrix[2]
    viewMatrix3x3[3] = viewMatrix[4]
    viewMatrix3x3[4] = viewMatrix[5]
    viewMatrix3x3[5] = viewMatrix[6]
    viewMatrix3x3[6] = viewMatrix[8]
    viewMatrix3x3[7] = viewMatrix[9]
    viewMatrix3x3[8] = viewMatrix[10]
    viewMatrix3x3 = inverse3x3(viewMatrix3x3, viewMatrix3x3)
    dirToCam[2] = viewMatrix3x3[6] + viewMatrix3x3[7] + viewMatrix3x3[8] 

    console.log(viewMatrix)
    console.log('(' + viewMatrix3x3[6] + '/' + viewMatrix3x3[7] + '/' + viewMatrix3x3[8] + ')')
    console.log(dirToCam)

    const objModelViewLocation = gl.getUniformLocation(objProgram, 'modelViewMatrix')
    const objProjMatrixLocation = gl.getUniformLocation(objProgram, 'projMatrix')
    const objtextureLocation = gl.getUniformLocation(objProgram, 'skyTexture')
    const objReflectionVectorLocation = gl.getUniformLocation(objProgram, 'reflectionVec')

    gl.uniform3fv(objReflectionVectorLocation, dirToCam)
    gl.uniform1i(objtextureLocation, 0)

    function renderObjects() {
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.useProgram(objProgram)      // err
        gl.bindBuffer(gl.ARRAY_BUFFER, objVbo)
        
        const objPositionAttribLocation = gl.getAttribLocation(objProgram, 'vertPos')
        gl.vertexAttribPointer( 
            objPositionAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            8 * Float32Array.BYTES_PER_ELEMENT,
            0 * Float32Array.BYTES_PER_ELEMENT
        )
        gl.enableVertexAttribArray(objPositionAttribLocation)

        const objNormalAttribLocation = gl.getAttribLocation(objProgram, 'vertNormal')
        gl.vertexAttribPointer(
            objNormalAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            8 * Float32Array.BYTES_PER_ELEMENT,
            5 * Float32Array.BYTES_PER_ELEMENT
        )
        gl.enableVertexAttribArray(objNormalAttribLocation)
        
        gl.cullFace(gl.BACK)
        
        gl.uniformMatrix4fv(objModelViewLocation, false, modelViewMatrix)
        gl.uniformMatrix4fv(objProjMatrixLocation, false, projectionMatrix)

        gl.drawArrays(gl.TRIANGLES, 0, obj.length / 8)

        gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }

    gl.clearColor(0.2, 0.2, 0.2, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)


    var angle = 0
    
    function draw() {
        gl.clearColor(0.2, 0.2, 0.2, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        
        // switch to skybox
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        var positionAttribLocation = gl.getAttribLocation(program, "vertPos")
        gl.vertexAttribPointer(
            positionAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT,
            0 * Float32Array.BYTES_PER_ELEMENT
        )
        gl.enableVertexAttribArray(positionAttribLocation)
        gl.cullFace(gl.FRONT)

        rotateY(yRotationMatrix, identityMatrix, angle)
        multiply(modelMatrix, yRotationMatrix, identityMatrix)
        multiply(modelViewMatrix, viewMatrix, modelMatrix)
        gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)

        angle += 0.005

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

        renderObjects()

        requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
}

window.onload = init