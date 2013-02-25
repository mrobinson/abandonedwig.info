/*
 * Copyright (C) 2005, 2006 Apple Computer, Inc.  All rights reserved.
 * Copyright (C) 2009 Torch Mobile, Inc.
 * Copyright (C) 2012 Martin Robinson
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */

// This is a port to JavaScript of the WebKit TransformationMatrix and FloatQuad
// classes with a handy helpers thrown in. This hasn't been optimized.

function TransformationMatrix() {
    this.toString = function() {
        return this.matrix[0] + " " + this.matrix[1] + " " +
               this.matrix[2] + " " + this.matrix[3] + "\n" +
               this.matrix[4] + " " + this.matrix[5] + " " +
               this.matrix[6] + " " + this.matrix[7] + "\n" +
               this.matrix[8] + " " + this.matrix[9] + " " +
               this.matrix[10] + " " + this.matrix[11] + "\n" +
               this.matrix[12] + " " + this.matrix[13] + " " +
               this.matrix[14] + " " + this.matrix[15];
    }

    this.set = function(i, j, value) {
        this.matrix[(i * 4) + j] = value;
    }

    this.get = function(i, j) {
        return this.matrix[(i * 4) + j];
    }

    this.multiply = function(other) {
        result = new TransformationMatrix();
        result.set(0, 0, other.get(0, 0) * this.get(0, 0) + other.get(0, 1) * this.get(1, 0) +
                         other.get(0, 2) * this.get(2, 0) + other.get(0, 3) * this.get(3, 0));
        result.set(0, 1, other.get(0, 0) * this.get(0, 1) + other.get(0, 1) * this.get(1, 1) +
                         other.get(0, 2) * this.get(2, 1) + other.get(0, 3) * this.get(3, 1));
        result.set(0, 2, other.get(0, 0) * this.get(0, 2) + other.get(0, 1) * this.get(1, 2) +
                         other.get(0, 2) * this.get(2, 2) + other.get(0, 3) * this.get(3, 2));
        result.set(0, 3, other.get(0, 0) * this.get(0, 3) + other.get(0, 1) * this.get(1, 3) +
                         other.get(0, 2) * this.get(2, 3) + other.get(0, 3) * this.get(3, 3));

        result.set(1, 0, other.get(1, 0) * this.get(0, 0) + other.get(1, 1) * this.get(1, 0) +
                         other.get(1, 2) * this.get(2, 0) + other.get(1, 3) * this.get(3, 0));
        result.set(1, 1, other.get(1, 0) * this.get(0, 1) + other.get(1, 1) * this.get(1, 1) +
                         other.get(1, 2) * this.get(2, 1) + other.get(1, 3) * this.get(3, 1));
        result.set(1, 2, other.get(1, 0) * this.get(0, 2) + other.get(1, 1) * this.get(1, 2) +
                         other.get(1, 2) * this.get(2, 2) + other.get(1, 3) * this.get(3, 2));
        result.set(1, 3, other.get(1, 0) * this.get(0, 3) + other.get(1, 1) * this.get(1, 3) +
                         other.get(1, 2) * this.get(2, 3) + other.get(1, 3) * this.get(3, 3));

        result.set(2, 0, other.get(2, 0) * this.get(0, 0) + other.get(2, 1) * this.get(1, 0) +
                         other.get(2, 2) * this.get(2, 0) + other.get(2, 3) * this.get(3, 0));
        result.set(2, 1, other.get(2, 0) * this.get(0, 1) + other.get(2, 1) * this.get(1, 1) +
                         other.get(2, 2) * this.get(2, 1) + other.get(2, 3) * this.get(3, 1));
        result.set(2, 2, other.get(2, 0) * this.get(0, 2) + other.get(2, 1) * this.get(1, 2) +
                         other.get(2, 2) * this.get(2, 2) + other.get(2, 3) * this.get(3, 2));
        result.set(2, 3, other.get(2, 0) * this.get(0, 3) + other.get(2, 1) * this.get(1, 3) +
                         other.get(2, 2) * this.get(2, 3) + other.get(2, 3) * this.get(3, 3));

        result.set(3, 0, other.get(3, 0) * this.get(0, 0) + other.get(3, 1) * this.get(1, 0) +
                         other.get(3, 2) * this.get(2, 0) + other.get(3, 3) * this.get(3, 0));
        result.set(3, 1, other.get(3, 0) * this.get(0, 1) + other.get(3, 1) * this.get(1, 1) +
                         other.get(3, 2) * this.get(2, 1) + other.get(3, 3) * this.get(3, 1));
        result.set(3, 2, other.get(3, 0) * this.get(0, 2) + other.get(3, 1) * this.get(1, 2) +
                         other.get(3, 2) * this.get(2, 2) + other.get(3, 3) * this.get(3, 2));
        result.set(3, 3, other.get(3, 0) * this.get(0, 3) + other.get(3, 1) * this.get(1, 3) +
                         other.get(3, 2) * this.get(2, 3) + other.get(3, 3) * this.get(3, 3));
        return result
    }

    this.translate = function(x, y) {
        this.set(3, 0, this.get(3, 0) + x * this.get(0, 0) + y * this.get(1, 0));
        this.set(3, 1, this.get(3, 1) + x * this.get(0, 1) + y * this.get(1, 1));
        this.set(3, 2, this.get(3, 2) + x * this.get(0, 2) + y * this.get(1, 2));
        this.set(3, 3, this.get(3, 3) + x * this.get(0, 3) + y * this.get(1, 3));
    }

    this.translate3d = function(x, y, z) {
        this.translate(x, y);
        this.set(3, 0, this.get(3, 0) + z * this.get(2, 0));
        this.set(3, 1, this.get(3, 1) + z * this.get(2, 1));
        this.set(3, 2, this.get(3, 2) + z * this.get(2, 2));
        this.set(3, 3, this.get(3, 3) + z * this.get(2, 3));
    }

    this.scale = function(sx, sy, sz) {
        this.set(0, 0, this.get(0, 0) * sx);
        this.set(0, 1, this.get(0, 1) * sx);
        this.set(0, 2, this.get(0, 2) * sx);
        this.set(0, 3, this.get(0, 3) * sx);

        this.set(1, 0, this.get(1, 0) * sy);
        this.set(1, 1, this.get(1, 1) * sy);
        this.set(1, 2, this.get(1, 2) * sy);
        this.set(1, 3, this.get(1, 3) * sy);
    }

    this.scale3d = function(sx, sy, sz) {
        this.scale(sx, sy);
        this.set(2, 0, this.get(2, 0) * sz);
        this.set(2, 1, this.get(2, 1) * sz);
        this.set(2, 2, this.get(2, 2) * sz);
        this.set(2, 3, this.get(2, 3) * sz);
    }

    this.rotate = function(axis, angle) {
        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        var cosTheta = Math.cos(angle);
        var sinTheta = Math.sin(angle);
        var oneMinusCosTheta = 1 - cosTheta;

        var newMatrix = new TransformationMatrix();
        newMatrix.set(0, 0, cosTheta + x * x * oneMinusCosTheta);
        newMatrix.set(1, 0, x * y * oneMinusCosTheta - z * sinTheta);
        newMatrix.set(2, 0, x * z * oneMinusCosTheta + y * sinTheta);
        newMatrix.set(3, 0, 0);

        newMatrix.set(0, 1, y * x * oneMinusCosTheta + z * sinTheta);
        newMatrix.set(1, 1, cosTheta + y * y * oneMinusCosTheta);
        newMatrix.set(2, 1, y * z * oneMinusCosTheta - x * sinTheta);
        newMatrix.set(3, 1, 0);

        newMatrix.set(0, 2, z * x * oneMinusCosTheta - y * sinTheta);
        newMatrix.set(1, 2, z * y * oneMinusCosTheta + x * sinTheta);
        newMatrix.set(2, 2, cosTheta + z * z * oneMinusCosTheta);
        newMatrix.set(3, 2, 0);

        newMatrix.set(0, 3, 0);
        newMatrix.set(1, 3, 0);
        newMatrix.set(2, 3, 0);
        newMatrix.set(3, 3, 1);

        newMatrix = this.multiply(newMatrix);
        this.matrix = newMatrix.matrix;
    }

    this.mapPoint = function(point) {
        var resultX = this.get(3, 0) + point[0] * this.get(0, 0) + point[1] * this.get(1, 0);
        var resultY = this.get(3, 1) + point[0] * this.get(0, 1) + point[1] * this.get(1, 1);
        var w = this.get(3, 3) + point[0] * this.get(0, 3) + point[1] * this.get(1, 3);
        if (w !== 1 && w !== 0) {
            resultX /= w;
            resultY /= w;
        }
        return [resultX, resultY];
    }

    this.mapQuad = function(floatQuad) {
        var result = new FloatQuad;
        result.setP1(this.mapPoint(floatQuad.p1()));
        result.setP2(this.mapPoint(floatQuad.p2()));
        result.setP3(this.mapPoint(floatQuad.p3()));
        result.setP4(this.mapPoint(floatQuad.p4()));
        return result;
    }


    function determinant2x2(a, b, c, d)
    {
        return a * d - b * c;
    }

function determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3)
{
    return a1 * determinant2x2(b2, b3, c2, c3)
         - b1 * determinant2x2(a2, a3, c2, c3)
         + c1 * determinant2x2(a2, a3, b2, b3);
}

function determinant4x4(transform)
{
    // Assign to individual variable names to aid selecting
    // correct elements
    var a1 = transform.get(0, 0);
    var b1 = transform.get(0, 1); 
    var c1 = transform.get(0, 2);
    var d1 = transform.get(0, 3);

    var a2 = transform.get(1, 0);
    var b2 = transform.get(1, 1); 
    var c2 = transform.get(1, 2);
    var d2 = transform.get(1, 3);

    var a3 = transform.get(2, 0); 
    var b3 = transform.get(2, 1);
    var c3 = transform.get(2, 2);
    var d3 = transform.get(2, 3);

    var a4 = transform.get(3, 0);
    var b4 = transform.get(3, 1); 
    var c4 = transform.get(3, 2);
    var d4 = transform.get(3, 3);

    return a1 * determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
         - b1 * determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
         + c1 * determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
         - d1 * determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
}

// adjoint( original_matrix, inverse_matrix )
//
//   calculate the adjoint of a 4x4 matrix
//
//    Let  a   denote the minor determinant of matrix A obtained by
//         ij
//
//    deleting the ith row and jth column from A.
// 
//                  i+j
//   Let  b   = (-1)    a
//        ij            ji
// 
//  The matrix B = (b  ) is the adjoint of A
//                   ij
function adjoint(transform)
{
    // Assign to individual variable names to aid
    // selecting correct values
    var a1 = transform.get(0, 0);
    var b1 = transform.get(0, 1); 
    var c1 = transform.get(0, 2);
    var d1 = transform.get(0, 3);

    var a2 = transform.get(1, 0);
    var b2 = transform.get(1, 1); 
    var c2 = transform.get(1, 2);
    var d2 = transform.get(1, 3);

    var a3 = transform.get(2, 0);
    var b3 = transform.get(2, 1);
    var c3 = transform.get(2, 2);
    var d3 = transform.get(2, 3);

    var a4 = transform.get(3, 0);
    var b4 = transform.get(3, 1); 
    var c4 = transform.get(3, 2);
    var d4 = transform.get(3, 3);

    // Row column labeling reversed since we transpose rows & columns
    var result = new TransformationMatrix();
    result.set(0, 0,   determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4));
    result.set(1, 0, - determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4));
    result.set(2, 0,   determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4));
    result.set(3, 0, - determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4));

    result.set(0, 1, - determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4));
    result.set(1, 1,   determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4));
    result.set(2, 1, - determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4));
    result.set(3, 1,   determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4));
        
    result.set(0, 2,   determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4));
    result.set(1, 2, - determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4));
    result.set(2, 2,   determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4));
    result.set(3, 2, - determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4));
        
    result.set(0, 3, - determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3));
    result.set(1, 3,   determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3));
    result.set(2, 3, - determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3));
    result.set(3, 3,   determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3));
    return result;
}

// calculate the inverse of a 4x4 matrix
// 
// -1     
// A  = ___1__ adjoint A
//       det A
this.inverse = function() {
    var invertedMatrix = adjoint(this);
    var determinant = determinant4x4(this);

    // If the determinate is sufficiently close to zero, the inverse matrix is not unique.
    var epsilon = 1.e-8;
    if (Math.abs(determinant) < epsilon)
        return new TransformationMatrix();

    // Scale the adjoint matrix to get the inverse
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++)
            invertedMatrix.set(i, j, invertedMatrix.get(i, j) / determinant);

    return invertedMatrix;
}

this.isInvertible = function() {
    var determinant = determinant4x4(this);
    var epsilon = 1.e-8;
    return Math.abs(determinant) >= epsilon
}

this.to2dTransform = function() {
    var result = new TransformationMatrix();
    result.matrix = new Float32Array(this.matrix);
    result.set(0, 2, 0);
    result.set(1, 2, 0);
    result.set(2, 0, 0);
    result.set(2, 1, 0);
    result.set(2, 2, 1);
    result.set(2, 3, 0);
    result.set(3, 2, 0);
    return result;
}

    this.matrix = new Float32Array(16);
    this.set(0, 0, 1);
    this.set(1, 1, 1);
    this.set(2, 2, 1);
    this.set(3, 3, 1);
    return this;
}

TransformationMatrix.orthographicProjection = function(width, height) {
    var near = 99999;
    var far = -99999;

    var projection = new TransformationMatrix()
    projection.set(0, 0, 2.0 / width);
    projection.set(1, 1, -2.0 / height);
    projection.set(2, 2, -2.0 / (far - near));
    projection.set(3, 0, -1.0);
    projection.set(3, 1, 1.0);
    projection.set(3, 2, -(far + near) / (far - near));
    return projection
}

function FloatQuad() {
    if (arguments.length >= 0) {
        this.points = [[arguments[0], arguments[1]],
                       [arguments[0] + arguments[2], arguments[1]],
                       [arguments[0] + arguments[2], arguments[1] + arguments[3]],
                       [arguments[0], arguments[1] + arguments[3]]];
    } else
        this.points = [[0, 0], [0, 0], [0, 0], [0, 0]];

    this.setP1 = function(point) { this.points[0] = point; }
    this.setP2 = function(point) { this.points[1] = point; }
    this.setP3 = function(point) { this.points[2] = point; }
    this.setP4 = function(point) { this.points[3] = point; }
    this.p1 = function() { return this.points[0]; }
    this.p2 = function() { return this.points[1]; }
    this.p3 = function() { return this.points[2]; }
    this.p4 = function() { return this.points[3]; }

    this.isCounterclockwise = function() {
        var v1 = [this.p2()[0] - this.p1()[0], this.p2()[1] - this.p1()[1]];
        var v2 = [this.p3()[0] - this.p2()[0], this.p3()[1] - this.p2()[1]];
        return (v1[0] * v2[1] - v1[1] * v2[0]) < 0;
    }

    this.clone = function() {
        var result = new FloatQuad();
        result.points = [this.points[0].slice(0),
                         this.points[1].slice(0),
                         this.points[2].slice(0),
                         this.points[3].slice(0)];
        return result;
    }

    this.move = function(width, height) {
        this.setP1([this.p1()[0] + width, this.p1()[1] + height]);
        this.setP2([this.p2()[0] + width, this.p2()[1] + height]);
        this.setP3([this.p3()[0] + width, this.p3()[1] + height]);
        this.setP4([this.p4()[0] + width, this.p4()[1] + height]);
    }

    this.scale = function(xScale, yScale) {
        this.setP1([this.p1()[0] * xScale, this.p1()[1] * yScale]);
        this.setP2([this.p2()[0] * xScale, this.p2()[1] * yScale]);
        this.setP3([this.p3()[0] * xScale, this.p3()[1] * yScale]);
        this.setP4([this.p4()[0] * xScale, this.p4()[1] * yScale]);
    }

    this.toString = function() {
        return this.p1()[0] + ", " + this.p1()[1] + "  " +
               this.p2()[0] + ", " + this.p2()[1] + "  " +
               this.p3()[0] + ", " + this.p3()[1] + "  " +
               this.p4()[0] + ", " + this.p4()[1];
    }

    this.boundingBox = function() {
        var left   = Math.min(this.p1()[0], this.p2()[0], this.p3()[0], this.p4()[0]);
        var right  = Math.max(this.p1()[0], this.p2()[0], this.p3()[0], this.p4()[0]);
        var top    = Math.min(this.p1()[1], this.p2()[1], this.p3()[1], this.p4()[1]);
        var bottom = Math.max(this.p1()[1], this.p2()[1], this.p3()[1], this.p4()[1]);
        return new FloatQuad(left, top, right - left, bottom - top);
    }

    this.toFixed = function(places) {
        this.setP1([this.p1()[0].toFixed(places), this.p1()[1].toFixed(places)]);
        this.setP2([this.p2()[0].toFixed(places), this.p2()[1].toFixed(places)]);
        this.setP3([this.p3()[0].toFixed(places), this.p3()[1].toFixed(places)]);
        this.setP4([this.p4()[0].toFixed(places), this.p4()[1].toFixed(places)]);
    }

    return this;
}
