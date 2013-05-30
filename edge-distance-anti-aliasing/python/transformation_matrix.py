#  Copyright (C) 2005, 2006 Apple Computer, Inc.  All rights reserved.
#  Copyright (C) 2009 Torch Mobile, Inc.
#  Copyright (C) 2012 Martin Robinson
#
#  Redistribution and use in source and binary forms, with or without
#  modification, are permitted provided that the following conditions
#  are met:
#  1. Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer.
#  2. Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in the
#     documentation and/or other materials provided with the distribution.
#
#  THIS SOFTWARE IS PROVIDED BY COPYRIGHT HOLDERS AND CONTRIBUTORS ``AS IS''
#  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
#  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
#  ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR CONTRIBUTORS BE
#  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
#  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
#  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
#  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
#  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
#  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
#  POSSIBILITY OF SUCH DAMAGE.

import math

"""
A loose port of the WebKit TransformationMatrix class to Python.
"""
class TransformationMatrix(list):

    _identify_transform_array = [1, 0, 0, 0,
                                 0, 1, 0, 0,
                                 0, 0, 1, 0,
                                 0, 0, 0, 1]

    def __init__(self, array=_identify_transform_array):
        self.append(array[0:4])
        self.append(array[4:8])
        self.append(array[8:12])
        self.append(array[12:16])

    def __mul__(self, other):
        if type(other) != TransformationMatrix:
            raise TypeError("A TransformationMatrix can only be multiplied with another TransformationMatrix.")

        result = TransformationMatrix()
        result[0][0] = (other[0][0] * self[0][0] + other[0][1] * self[1][0]
                   + other[0][2] * self[2][0] + other[0][3] * self[3][0]);
        result[0][1] = (other[0][0] * self[0][1] + other[0][1] * self[1][1]
                   + other[0][2] * self[2][1] + other[0][3] * self[3][1]);
        result[0][2] = (other[0][0] * self[0][2] + other[0][1] * self[1][2]
                   + other[0][2] * self[2][2] + other[0][3] * self[3][2]);
        result[0][3] = (other[0][0] * self[0][3] + other[0][1] * self[1][3]
                   + other[0][2] * self[2][3] + other[0][3] * self[3][3]);

        result[1][0] = (other[1][0] * self[0][0] + other[1][1] * self[1][0]
                   + other[1][2] * self[2][0] + other[1][3] * self[3][0]);
        result[1][1] = (other[1][0] * self[0][1] + other[1][1] * self[1][1]
                   + other[1][2] * self[2][1] + other[1][3] * self[3][1]);
        result[1][2] = (other[1][0] * self[0][2] + other[1][1] * self[1][2]
                   + other[1][2] * self[2][2] + other[1][3] * self[3][2]);
        result[1][3] = (other[1][0] * self[0][3] + other[1][1] * self[1][3]
                   + other[1][2] * self[2][3] + other[1][3] * self[3][3]);

        result[2][0] = (other[2][0] * self[0][0] + other[2][1] * self[1][0]
                   + other[2][2] * self[2][0] + other[2][3] * self[3][0]);
        result[2][1] = (other[2][0] * self[0][1] + other[2][1] * self[1][1]
                   + other[2][2] * self[2][1] + other[2][3] * self[3][1]);
        result[2][2] = (other[2][0] * self[0][2] + other[2][1] * self[1][2]
                   + other[2][2] * self[2][2] + other[2][3] * self[3][2]);
        result[2][3] = (other[2][0] * self[0][3] + other[2][1] * self[1][3]
                   + other[2][2] * self[2][3] + other[2][3] * self[3][3]);

        result[3][0] = (other[3][0] * self[0][0] + other[3][1] * self[1][0]
                   + other[3][2] * self[2][0] + other[3][3] * self[3][0]);
        result[3][1] = (other[3][0] * self[0][1] + other[3][1] * self[1][1]
                   + other[3][2] * self[2][1] + other[3][3] * self[3][1]);
        result[3][2] = (other[3][0] * self[0][2] + other[3][1] * self[1][2]
                   + other[3][2] * self[2][2] + other[3][3] * self[3][2]);
        result[3][3] = (other[3][0] * self[0][3] + other[3][1] * self[1][3]
                   + other[3][2] * self[2][3] + other[3][3] * self[3][3]);
        return result

    def translate(self, x, y, z=0):
        self[3][0] += x * self[0][0] + y * self[1][0] + z * self[2][0];
        self[3][1] += x * self[0][1] + y * self[1][1] + z * self[2][1];
        self[3][2] += x * self[0][2] + y * self[1][2] + z * self[2][2];
        self[3][3] += x * self[0][3] + y * self[1][3] + z * self[2][3];

    def scale(self, sx, sy, sz=1):
        self[0][0] *= sx;
        self[0][1] *= sx;
        self[0][2] *= sx;
        self[0][3] *= sx;

        self[1][0] *= sy;
        self[1][1] *= sy;
        self[1][2] *= sy;
        self[1][3] *= sy;

        self[2][0] *= sz;
        self[2][1] *= sz;
        self[2][2] *= sz;
        self[2][3] *= sz;

    def rotate(self, axis, angle):
        x, y, z = axis
        cos_theta = math.cos(angle)
        sin_theta = math.sin(angle)
        one_minus_cos_theta = 1 - cos_theta

        matrix = TransformationMatrix()
        matrix[0][0] = cos_theta + x * x * one_minus_cos_theta
        matrix[1][0] = x * y * one_minus_cos_theta - z * sin_theta;
        matrix[2][0] = x * z * one_minus_cos_theta + y * sin_theta;
        matrix[3][0] = 0

        matrix[0][1] = y * x * one_minus_cos_theta + z * sin_theta;
        matrix[1][1] = cos_theta + y * y * one_minus_cos_theta;
        matrix[2][1] = y * z * one_minus_cos_theta - x * sin_theta;
        matrix[3][1] = 0

        matrix[0][2] = z * x * one_minus_cos_theta - y * sin_theta;
        matrix[1][2] = z * y * one_minus_cos_theta + x * sin_theta;
        matrix[2][2] = cos_theta + z * z * one_minus_cos_theta;
        matrix[3][2] = 0

        matrix[0][3] = 0
        matrix[1][3] = 0
        matrix[2][3] = 0
        matrix[3][3] = 1

        matrix = self * matrix
        self[0] = matrix[0]
        self[1] = matrix[1]
        self[2] = matrix[2]
        self[3] = matrix[3]

    @staticmethod
    def orthographic_projection(width, height, near=99999, far=-99999):
        result = TransformationMatrix()
        result[0][0] = 2.0 / width
        result[1][1] = 2.0 / height
        result[2][2] = -2.0 / (far - near)
        result[3][0] = result[3][1] = -1.0
        result[3][2] = -(far + near) / (far - near)
        return result

    def as_array(self):
        return self[0] + self[1] + self[2] + self[3]

t = TransformationMatrix.orthographic_projection(500, 500);
print t.as_array()
