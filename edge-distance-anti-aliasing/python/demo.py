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

import OpenGL
import math
import sys
import time

from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
from OpenGL.GL.shaders import *
from ctypes import *
from transformation_matrix import TransformationMatrix

OpenGL.ERROR_ON_COPY = True

class Quad(object):
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height

        self._last_time = time.time()
        self._rotation_angle = 0
        self._rotation_time = 0

    def set_rotation_animation(self, axis, full_rotation_time):
        self._rotation_time = full_rotation_time
        self.rotation_axis = axis

    def update_animation(self):
        new_time = time.time()
        difference = new_time - self._last_time
        self._last_time = new_time

        if self._rotation_time:
            self._rotation_angle = self._rotation_angle + (difference / self._rotation_time) * (math.pi * 2)
            self._rotation_angle = self._rotation_angle % (2 * math.pi)

        self.current_transform = self._calculate_transform()

    def _calculate_transform(self):
        center = (self.x + (self.width / 2.0), self.y + (self.height / 2.0))
        matrix = TransformationMatrix()

        # Translating the to the centroid means that the center of rotation is the centroid.
        matrix.translate(center[0], center[1])
        matrix.rotate(self.rotation_axis, self._rotation_angle)
        matrix.translate(-center[0], -center[1])

        return matrix

class SimpleProgram(object):
    _vertex_shader_source = """
        attribute vec4 a_vertex;
        uniform mat4 u_matrix;
        void main() {
            gl_Position = u_matrix * a_vertex;
        }
    """

    _fragment_shader_source = """
        uniform vec4 u_color;
        void main() {
            gl_FragColor = u_color;
        }
    """

    def __init__(self):
        print self._vertex_shader_source
        self.program = compileProgram(
            compileShader(self._vertex_shader_source, GL_VERTEX_SHADER),
            compileShader(self._fragment_shader_source, GL_FRAGMENT_SHADER))

        self.vertex_location = glGetAttribLocation(self.program, "a_vertex")
        self.matrix_location = glGetUniformLocation(self.program, "u_matrix")
        self.color_location = glGetUniformLocation(self.program, "u_color")

class EdgeDistanceAntiAliasingProgram(SimpleProgram):
    _fragment_shader_source = """
        uniform vec4 u_color;
        uniform vec3 u_expandedQuadEdgesInScreenSpace[8];
        void main()
        {
            vec3 pos = vec3(gl_FragCoord.xy, 1);

            // The data passed in u_expandedQuadEdgesInScreenSpace is merely the
            // pre-scaled coeffecients of the line equations describing the four edges
            // of the expanded quad in screen space and the rectangular bounding box
            // of the expanded quad.
            //
            // We are doing a simple distance calculation here according to the formula:
            // (A*p.x + B*p.y + C) / sqrt(A^2 + B^2) = distance from line to p
            // Note that A, B and C have already been scaled by 1 / sqrt(A^2 + B^2).
            float a0 = clamp(dot(u_expandedQuadEdgesInScreenSpace[0], pos), 0.0, 1.0);
            float a1 = clamp(dot(u_expandedQuadEdgesInScreenSpace[1], pos), 0.0, 1.0);
            float a2 = clamp(dot(u_expandedQuadEdgesInScreenSpace[2], pos), 0.0, 1.0);
            float a3 = clamp(dot(u_expandedQuadEdgesInScreenSpace[3], pos), 0.0, 1.0);
            float a4 = clamp(dot(u_expandedQuadEdgesInScreenSpace[4], pos), 0.0, 1.0);
            float a5 = clamp(dot(u_expandedQuadEdgesInScreenSpace[5], pos), 0.0, 1.0);
            float a6 = clamp(dot(u_expandedQuadEdgesInScreenSpace[6], pos), 0.0, 1.0);
            float a7 = clamp(dot(u_expandedQuadEdgesInScreenSpace[7], pos), 0.0, 1.0);

            // Now we want to reduce the alpha value of the fragment if it is close to the
            // edges of the expanded quad (or rectangular bounding box -- which seems to be
            // important for backfacing quads). Note that we are combining the contribution
            // from the (top || bottom) and (left || right) edge by simply multiplying. This follows
            // the approach described at: http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter22.html,
            // in this case without using Gaussian weights.
            gl_FragColor = u_color * min(min(a0, a2) * min(a1, a3), min(a4, a6) * min(a5, a7));
        }
    """

    def __init__(self):
        super(EdgeDistanceAntiAliasingProgram, self).__init__()
        self.expanded_quad_edges_in_screen_space_location = \
            glGetAttribLocation(self.program, "u_expandedQuadEdgesInScreenSpace")

class EdgeDistanceAntiAliasingExample(object):
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.quads = []

        glutInitWindowSize(width, height)
        self.window = glutCreateWindow("Edge-distance anti-aliasing")

        glutDisplayFunc(lambda: self.draw_scene())
        glutIdleFunc(lambda: self.draw_scene())
        glutReshapeFunc(lambda width, height: self.reshape(width, height))
        glutKeyboardFunc(lambda key, x, y: self.key_pressed(key, x, y))

        self.initialize_scene()

    def initialize_scene(self):
        glClearColor(1, 1, 1, 1)
        self.reshape(self.width, self.height)

        if not glUseProgram:
            print 'Missing Shader Objects!'
            sys.exit(1)

        self.program = EdgeDistanceAntiAliasingProgram()

        quad = Quad(100, 100, 300, 300)
        quad.set_rotation_animation((0, 0, 1), 10)
        self.quads.append(quad)

    def draw_scene(self):
        glClear(GL_COLOR_BUFFER_BIT)
        glLoadIdentity();

        for quad in self.quads:
            quad.update_animation()
            self.draw_quad(quad)

        glutSwapBuffers()

    def draw_quad(self, quad):
        glUseProgram(self.program.program)

        glEnableVertexAttribArray(self.program.vertex_location)

        #float_array_type = c_float * 8
        #quad_vertices = float_array_type(0, 0, 1, 0, 1, 1, 0, 1)
        #glVertexAttribPointer(self.program.vertex_location, 2, GL_FLOAT, GL_FALSE, 0, quad_vertices)
        glVertexAttrib2fv(self.program.vertex_location, [0, 0, 1, 0, 1, 1, 0, 1], 8)

        matrix = self.projection_matrix * quad.current_transform

        # Expand texture coordinates (the unit rectangle) to be
        # the size of the quad we are drawing.
        matrix.translate(quad.x, quad.y)
        matrix.scale(quad.width, quad.height)
        matrix = matrix.as_array()

        glUniform4f(self.program.color_location, 0.0, 0.0, 0.0, 1.0)

        glUniformMatrix4fv(self.program.matrix_location, 1, GL_FALSE, matrix)
        glDrawArrays(GL_TRIANGLE_FAN, 0, 4)

    def reshape(self, width, height):
        if height == 0:
            height = 1

        glViewport(0, 0, width, height)
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        glOrtho(0, width, height, 0, -10000, 100);
        glMatrixMode(GL_MODELVIEW)

        self.projection_matrix = TransformationMatrix.orthographic_projection(width, height)

    def key_pressed(self, key, x, y):
        escape_key = '\x1b'
        if key == escape_key:
            sys.exit()

def main():
    glutInit(sys.argv)
    glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE)

    example = EdgeDistanceAntiAliasingExample(500, 500)

    glutMainLoop()

if __name__ == "__main__":
    print "Hit ESC key to quit."
    main()

