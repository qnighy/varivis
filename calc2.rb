# frozen_string_literal: true

require "matrix"

# Y = [0.2126, 0.7152, 0.0722] * [R, G, B]
# [a00 a01 a02] [R]
# [a10 a11 a12] [G]
# [a20 a21 a22] [B]

## When distributed by 1 : 2sqrt(3) : 3 ratio, it preserves
## the original luminance.
## The ratio is the ratio of area occupied by triangles, squares, and hexagons each
## in a rhombitrihexagonal tiling.
#
#                        [a00 a01 a02]
# [0.1340 0.4641 0.4019] [a10 a11 a12] = [0.2126 0.7152 0.0722]
#                        [a20 a21 a22]

## It preserves white point.
# [a00 a01 a02] [1]   [1]
# [a10 a11 a12] [1] = [1]
# [a20 a21 a22] [1]   [1]

## The first component (i.e. triangle) is Green - Red.
# [a00 a01 a02] [-1 + x]   [1]
# [a10 a11 a12] [ 1 + x] = [0]
# [a20 a21 a22] [ 0 + x]   [0]
# here we have:
#
#                                 [1]
# 0.1340 = [0.1340 0.4641 0.4019] [0]
#                                 [0]
#
#                                 [a00 a01 a02] [-1 + x]
#        = [0.1340 0.4641 0.4019] [a10 a11 a12] [ 1 + x]
#                                 [a20 a21 a22] [ 0 + x]
#
#                                 [-1 + x]
#        = [0.2126 0.7152 0.0722] [ 1 + x]
#                                 [ 0 + x]
#        = (0.7152 - 0.2126) + x
#
# Therefore x = 0.1340 - (0.7152 - 0.2126) = -0.3686

## The third component (i.e. hexagon) is Blue.
# [a00 a01 a02] [0 + y]   [0]
# [a10 a11 a12] [0 + y] = [0]
# [a20 a21 a22] [1 + y]   [1]
#
#                                 [0]
# 0.4019 = [0.1340 0.4641 0.4019] [0]
#                                 [1]
#
#                                 [a00 a01 a02] [0 + y]
#        = [0.1340 0.4641 0.4019] [a10 a11 a12] [0 + y]
#                                 [a20 a21 a22] [1 + y]
#
#                                 [0 + y]
#        = [0.2126 0.7152 0.0722] [0 + y]
#                                 [1 + y]
#        = 0.0722 + y
#
# Therefore y = 0.4019 - 0.0722 = 0.3297

x = 0.1340 - (0.7152 - 0.2126)
y = 0.4019 - 0.0722

# Solve the equations above i.e.
# [a00 a01 a02] [1  -1 + x  0 + y] = [1 1 0]
# [a10 a11 a12] [1   1 + x  0 + y] = [1 0 0]
# [a20 a21 a22] [1   0 + x  1 + y] = [1 0 1]

a = Matrix[
    [1, 1, 0],
    [1, 0, 0],
    [1, 0, 1]
] * Matrix[
    [1, -1 + x, 0 + y],
    [1, 1 + x, 0 + y],
    [1, 0 + x, 1 + y]
].inverse
p a
p Matrix[[0.1340, 0.4641, 0.4019]] * a
p a * Vector[1, 1, 1]
p a * Vector[-1 + x, 1 + x, 0 + x]
p a * Vector[0 + y, 0 + y, 1 + y]