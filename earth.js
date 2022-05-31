async function init() {
    let vertexShaderText = `
        precision mediump float;

        attribute vec3 vertPos;
        attribute vec3 vertNormal; 
        attribute vec2 vertTexCoord;

        uniform mat4 modelViewMatrix;
        uniform mat4 projMatrix;
        uniform mat3 normalMatrix; 

        varying vec2 texCoord;
        varying vec3 Normal;
        varying vec3 Position;

        void main(){
            gl_Position = projMatrix * modelViewMatrix * vec4(vertPos, 1.0);
            texCoord = vertTexCoord;
            Position = vec3(modelViewMatrix * vec4(vertPos, 1.0));
            Normal = normalize(normalMatrix * vertNormal);
        }
    `

    let fragmentShaderText = `
        precision mediump float;

        varying vec2 texCoord;
        varying vec3 Normal;
        varying vec3 Position;

        uniform sampler2D inTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specTexture;
        uniform sampler2D cloudTexture;

        uniform vec4 lightPosition; 
        uniform float matShininess;
        // uniform vec4 matSpec;       // new
        // uniform vec4 lightSpec;     // new


        // uniform vec4 lightDiffuse; 

        void main() {
            vec3 N = normalize(Normal);
            vec3 L = vec3(0.0);
            vec3 H = vec3(0.0);
            
            L = normalize(vec3(lightPosition) - Position);
            float diffuseLight = max(dot(N, L), 0.0);
            vec4 specular = vec4(0.0, 0.0, 0.0, 1.0);
            vec3 posEye = vec3(0.0, 0.0, 1.0);
            H = normalize(L + posEye);

            if (diffuseLight > 0.0) {
                float specLight = pow(max(dot(H, N), 0.0), matShininess);
                specular = specLight * texture2D(specTexture, texCoord);
            }
            
            vec4 dayColor = texture2D(inTexture, texCoord);
            vec4 nightColor = texture2D(nightTexture, texCoord);
            vec4 cloudColor = texture2D(cloudTexture, texCoord);            
            // gl_FragColor = mix(nightColor, dayColor, diffuseLight) + specular;
            gl_FragColor = mix(mix(nightColor, dayColor, diffuseLight), cloudColor, cloudColor.r) + specular;
            // gl_FragColor = vec4(cloudColor.a);
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

    var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal')
    gl.vertexAttribPointer(
        normalAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(normalAttribLocation)

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
    var normalMatrix = new Float32Array(9)

    identity(modelMatrix)
    lookAt(viewMatrix, [0,0,-5], [0,0,0], [0,1,0])
    perspective(projectionMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0)
    multiply(modelViewMatrix, viewMatrix, modelMatrix)

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

    const modelViewLocation = gl.getUniformLocation(program, "modelViewMatrix")
    const projLocation = gl.getUniformLocation(program, "projMatrix")
    const normalMatrixUniformLocation = gl.getUniformLocation(program, 'normalMatrix')
    gl.uniformMatrix4fv(modelViewLocation, gl.FALSE, modelViewMatrix)
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projectionMatrix)
    gl.uniformMatrix3fv(normalMatrixUniformLocation, gl.FALSE, normalMatrix)
    
    var yRotationMatrix = new Float32Array(16)
    var identityMatrix = new Float32Array(16)
    identity(identityMatrix)

    // light setup
    var lightPosition = new Float32Array(4)
    lightPosition[0] = 0.0 
    lightPosition[1] = 0.0
    lightPosition[2] = 4.0
    lightPosition[3] = 1.0

    var materialShininess = 1000.0

    const lightPositonUniformLocation = gl.getUniformLocation(program, 'lightPosition')
    var materialShininessUniformLocation = gl.getUniformLocation(program, "matShininess");
    gl.uniform4fv(lightPositonUniformLocation, lightPosition)
    gl.uniform1f(materialShininessUniformLocation, materialShininess)

    // texture setup
    var inTextureUniformLocation = gl.getUniformLocation(program, 'inTexture')
    gl.uniform1i(inTextureUniformLocation, 0)
    var nightTextureUniformLocation = gl.getUniformLocation(program, 'nightTexture')
    gl.uniform1i(nightTextureUniformLocation, 1)
    var specTextureUniformLocation = gl.getUniformLocation(program, 'specTexture')
    gl.uniform1i(specTextureUniformLocation, 2)
    var cloudTextureUniformLocation = gl.getUniformLocation(program, 'cloudTexture')
    gl.uniform1i(cloudTextureUniformLocation, 3)
    gl.activeTexture(gl.TEXTURE0)
    var texture = await loadTexture(gl, 'earth_day.png')
    gl.activeTexture(gl.TEXTURE1)
    var nightTexture = await loadTexture(gl, 'earth_night.png')
    gl.activeTexture(gl.TEXTURE2)
    var oceanTexture = await loadTexture(gl, 'earth_ocean_mask.png')
    gl.activeTexture(gl.TEXTURE3)
    var cloudTexture = await loadTexture(gl, 'earth_clouds.png')

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