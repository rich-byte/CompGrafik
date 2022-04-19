function identity(out) {
    for (var i = 0; i < 16; i++) {
        out[i] = 0
    }

    out[0] = 1
    out[5] = 1
    out[10] = 1
    out[15] = 1

    return out
}

function translate(out, inMat, v) {  // different in glMatrix  
    var x = v[0]
    var y = v[1]
    var z = v[2]

    out[12] = x*inMat[0] + y*inMat[4] + z*inMat[8] + inMat[12]
    out[13] = x*inMat[1] + y*inMat[5] + z*inMat[9] + inMat[13]
    out[14] = x*inMat[2] + y*inMat[6] + z*inMat[10] + inMat[14]
    out[15] = x*inMat[3] + y*inMat[7] + z*inMat[11] + inMat [15]

    return out
}

function scale(out, inMat, v) { // multiply each column with corresponding vector coordinate. WebGL works in columns  
    var x = v[0]
    var y = v[1]
    var z = v[2]

    out[0] = inMat[0] * x
    out[1] = inMat[1] * x
    out[2] = inMat[2] * x
    out[3] = inMat[3] * x
    out[4] = inMat[4] * y
    out[5] = inMat[5] * y
    out[6] = inMat[6] * y
    out[7] = inMat[7] * y
    out[8] = inMat[8] * z
    out[9] = inMat[9] * z
    out[10] = inMat[10] * z
    out[11] = inMat[11] * z
    out[12] = inMat[12] 
    out[13] = inMat[13]
    out[14] = inMat[14]
    out[15] = inMat[15]

    return out
}

function rotateY(out, inMat, rad) {
    var sin = Math.sin(rad)
    var cos = Math.cos(rad)

    out[0] = inMat[0]*cos - inMat[8]*sin
    out[1] = inMat[1]*cos - inMat[9]*sin
    out[2] = inMat[2]*cos - inMat[10]*sin
    out[3] = inMat[3]*cos - inMat[11]*sin

    out[4] = inMat[4]
    out[5] = inMat[5]
    out[6] = inMat[6]
    out[7] = inMat[7]
    
    out[8] = inMat[0]*sin + inMat[8]*cos
    out[9] = inMat[1]*sin + inMat[9]*cos
    out[10] = inMat[2]*sin + inMat[10]*cos
    out[11] = inMat[3]*sin + inMat[11]*cos

    out[12] = inMat[12]
    out[13] = inMat[13]
    out[14] = inMat[14]
    out[15] = inMat[15]

    return out
}

function rotateX(out, inMat, rad) { // untested
    var sin = Math.sin(rad)
    var cos = Math.cos(rad)

    out[0] = inMat[0]
    out[1] = inMat[1]
    out[2] = inMat[2]
    out[3] = inMat[3]

    out[4] = inMat[4]*cos + inMat[8]*sin
    out[5] = inMat[5]*cos + inMat[9]*sin
    out[6] = inMat[6]*cos + inMat[10]*sin
    out[7] = inMat[7]*cos + inMat[11]*sin
    
    out[8] = inMat[8]*cos - inMat[4]*sin
    out[9] = inMat[9]*cos - inMat[5]*sin
    out[10] = inMat[10]*cos - inMat[6]*sin
    out[11] = inMat[11]*cos - inMat[7]*sin

    out[12] = inMat[12]
    out[13] = inMat[13]
    out[14] = inMat[14]
    out[15] = inMat[15]
}