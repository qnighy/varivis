# frozen_string_literal: true

require "matrix"

# Normalized to equal energy illminant
xyzToLmsEE = Matrix[
  [0.38971, 0.68898, -0.07868],
  [-0.22981, 1.18340, 0.04641],
  [0.00000, 0.00000, 1.00000]
]
# Normalized to D65 illminant
xyzToLmsD65 = Matrix[
  [0.4002, 0.7076, -0.0808],
  [-0.2263, 1.1653, 0.0457],
  [0.0000, 0.0000, 0.9182]
]

# Linear-sRGB to XYZ
lsRgbToXyz = Matrix[
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.0721750],
  [0.0193339, 0.1191920, 0.9503041]
]

lsRgbToLmsD65 = xyzToLmsD65 * lsRgbToXyz
puts "linear-sRGB to LMS = #{lsRgbToLmsD65}"
puts "LMS to linear-sRGB = #{lsRgbToLmsD65.inverse}"
puts "Normalization test: #{ lsRgbToLmsD65 * Vector[1.0, 1.0, 1.0] }"
puts "Contribution of L/M/S to Y: #{ xyzToLmsD65.inverse.row(1) }"
