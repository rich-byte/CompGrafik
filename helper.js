'use strict';

async function getFileText(url) {
    let response = await fetch(url)
    let text = await response.text()
    return text
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