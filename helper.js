'use strict';

async function getFileText(url) {
    let response = await fetch(url)
    let text = await response.text()
    return text
}

async function getDataFromObj(url) {
    let text = await getFileText(url)
    let lineList = text.split(/\r*\n/)

    var vList = [] // 3-4 elemnts per vertex x,y,z(,w)
    var vtList = [] // 1-3 elements per texture coordinate u(,v,w)
    var vnList = [] // 3 elements per vertex normal x,y,z
    var fList = [] // TODO: should vbo?
    
    lineList.forEach(line => {
        let splitLine = line.trim().split(/\s+/)
        switch (splitLine.shift()) {
            case "v":
                addSplitLineToList(splitLine, vList)
                break;
            case "vn":
                addSplitLineToList(splitLine, vnList)
                break;
            case "vt":
                addSplitLineToList(splitLine, vtList)
                break;
            case "f":
                splitLine.forEach(element => {
                    let indices = element.split("/") // second / needed here?
                    let index = parseInt(indices[0]) - 1
                    vList[index].forEach(coord => {
                        fList.push(coord)
                    });
                    
                    vtList[parseInt(indices[1]) - 1].forEach(coord => {
                        fList.push(coord)
                    });

                    vnList[parseInt(indices[2]) - 1].forEach(coord => {
                        fList.push(coord)
                    });
                });
                break;
            default:
                break;
        }
    });

    return fList
}

async function setupVideo(id) {
    const video = document.getElementById(id)
    var playing = false
    var timeUpdate = false
    var copyVideo = false

    video.autoplay = true
    video.muted = true
    video.loop = true

    video.addEventListener('playing', function() {
        playing = true
        checkReady()
    }, true)

    video.addEventListener('timeupdate', function() {
        timeUpdate = true
        checkReady()
    }, true)

    video.play()

    function checkReady() {
        if( playing && timeUpdate){
            copyVideo = true
        }
    }

    return video
}


async function loadTexture(gl, url) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // make texture with one pixel to allow texture to load
    const level = 0
    const internalFormat = gl.RGBA
    const width = 1
    const height = 1
    const border = 0
    const srcFormat = gl.RGBA
    const srcType = gl.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255])
    gl.texImage2D(gl.TEXTURE_2D,
        level, 
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel)
    
    // attach and load real texture
    const image = new Image()
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 
            level, 
            internalFormat, 
            srcFormat, 
            srcType, 
            image)
        
        gl.generateMipmap(gl.TEXTURE_2D)

    }
    image.src = url

    return texture
}

function addSplitLineToList(line, list) {
    for (let i = 0; i < line.length; i++) {
        line[i] = parseFloat(line[i])
    }

    // if (splitLine.length == 3) { // add default w if only x,y,z were given
    //     splitLine.push(1.0)
    // }

    list.push(line)
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

function iboSetup(context, indices) {
    let ibo = context.createBuffer()
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, ibo)
    context.bufferData(context.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        context.STATIC_DRAW)
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, null)
    return ibo
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

function initVertexShader(context, vertexShaderText) {
    const vertexShader = context.createShader(context.VERTEX_SHADER)
    context.shaderSource(vertexShader, vertexShaderText)
    context.compileShader(vertexShader)

    // check for compile errors (not automatic)
	if (!context.getShaderParameter(vertexShader, context.COMPILE_STATUS)) 
	{
        console.error("Error compiling vertexShader: ", context.getShaderInfoLog(vertexShader))
	}

    return vertexShader
}

function initFragShader(context, fragmentShaderText) {
    const fragShader = context.createShader(context.FRAGMENT_SHADER)
    context.shaderSource(fragShader, fragmentShaderText)
    context.compileShader(fragShader)

    // check for compile errors (not automatic)
	if (!context.getShaderParameter(fragShader, context.COMPILE_STATUS)) 
	{
        console.error("Error compiling fragmentShader: ", context.getShaderInfoLog(fragShader))
	}

    return fragShader
}

/**
 * RGB normalized to [0,1]
 * @param {Float} r  
 * @param {Float} g 
 * @param {Float} b 
 * @returns H in [0,360]° and S and V in [0,1]
 */
// function rgbToHsv(r, g, b) {
    
// }