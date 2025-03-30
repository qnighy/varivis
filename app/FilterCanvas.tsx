import { ForwardedRef, forwardRef, ReactElement, useEffect, useImperativeHandle, useRef } from "react";
import * as twgl from "twgl.js";
import { ColorDeficiencySimulation } from "./state";

export type FilterCanvasProps = {
  className?: string;
  style?: React.CSSProperties;
  colorDeficiencySimulation: ColorDeficiencySimulation;
  unitLength: number;
};
export type FilterCanvasHandle = {
  element: HTMLCanvasElement;
  update: (element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement) => void;
};

function FilterCanvas(props: FilterCanvasProps, ref: ForwardedRef<FilterCanvasHandle>): ReactElement | null {
  const { className, style, colorDeficiencySimulation, unitLength } = props;

  const elemRef = useRef<HTMLCanvasElement>(null);
  const renderContext = useRef<RenderContext | null>(null);
  // Copy the class here to allow reloading in dev mode
  const RenderContext_ = RenderContext;
  useEffect(() => {
    if (elemRef.current) {
      renderContext.current = new RenderContext_(elemRef.current);
    }
    return () => {
      renderContext.current?.[Symbol.dispose]();
      renderContext.current = null;
    };
  }, [RenderContext_]);
  useEffect(() => {
    renderContext.current?.update(undefined, {
      colorDeficiencySimulation,
      unitLength,
    });
  }, [colorDeficiencySimulation, unitLength]);
  useImperativeHandle(ref, () => ({
    element: elemRef.current!,
    update: (element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement) => {
      renderContext.current?.update(element, {
        colorDeficiencySimulation,
        unitLength,
      });
    },
  }), [colorDeficiencySimulation, unitLength]);
  return (
    <canvas
      className={className}
      style={style}
      ref={elemRef}
    />
  );
}
const FilterCanvas_ = forwardRef(FilterCanvas);
export { FilterCanvas_ as FilterCanvas };

type UpdateOptions = {
  colorDeficiencySimulation: ColorDeficiencySimulation;
  unitLength: number;
};

class RenderContext {
  #canvas: HTMLCanvasElement;
  #gl: WebGL2RenderingContext;
  #programInfo: twgl.ProgramInfo;
  #bufferInfo: twgl.BufferInfo;
  #texture: WebGLTexture;
  #hasTexture: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL 2.0 not supported in this browser.");
    }
    this.#gl = gl;

    this.#programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);
    this.#bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);
    const blue = [0, 0, 255, 255];
    this.#texture = twgl.createTexture(gl, {
      src: blue,
      min: gl.LINEAR,
      mag: gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
    });
    // Use our program and buffers
    this.#gl.useProgram(this.#programInfo.program);
    twgl.setBuffersAndAttributes(this.#gl, this.#programInfo, this.#bufferInfo);
  }

  update(
    element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | undefined,
    options: UpdateOptions
  ) {
    const { colorDeficiencySimulation, unitLength } = options;
    // If the video is ready, update the texture
    if (element instanceof HTMLVideoElement) {
      if (element.readyState >= element.HAVE_CURRENT_DATA) {
        // Update the texture with the current video frame
        twgl.setTextureFromElement(this.#gl, this.#texture, element);
        this.#hasTexture = true;
      }
    } else if (element) {
      twgl.setTextureFromElement(this.#gl, this.#texture, element);
      this.#hasTexture = true;
    }
    if (!this.#hasTexture) {
      // Not ready
      return;
    }
    const { width, height } =
      element instanceof HTMLVideoElement
        ? { width: element.videoWidth, height: element.videoHeight }
        : element
        ? { width: element.width, height: element.height }
        : { width: this.#canvas.width, height: this.#canvas.height };
    this.#canvas.width = width;
    this.#canvas.height = height;

    // Adjust viewport/canvas size if needed
    // twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    this.#gl.viewport(0, 0, width, height);

    // Clear the canvas
    this.#gl.clearColor(0, 0, 0, 1);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

    const unitSize = unitLength / this.#canvas.clientWidth * width;
    // Set uniforms (the texture)
    const uniforms = {
      u_texture: this.#texture,
      u_unitDimension: [width / unitSize, height / unitSize],
      u_colorDeficiencySimulation: COLOR_DEFICIENCY_SIMULATIONS[colorDeficiencySimulation],
    };
    twgl.setUniforms(this.#programInfo, uniforms);

    // Draw!
    twgl.drawBufferInfo(this.#gl, this.#bufferInfo);
  }

  [Symbol.dispose]() {
    if (this.#texture) {
      this.#gl.deleteTexture(this.#texture);
    }
    if (this.#programInfo) {
      this.#gl.deleteProgram(this.#programInfo.program);
    }
    if (this.#bufferInfo?.attribs) {
      this.#gl.deleteBuffer(this.#bufferInfo.attribs.position.buffer);
      this.#gl.deleteBuffer(this.#bufferInfo.attribs.texcoord.buffer);
    }
  }
}

const vertexShader = `
  attribute vec4 position;
  attribute vec2 texcoord;
  varying vec2 v_texcoord;

  void main() {
    // Flip position vertically (but not horizontally)
    gl_Position = vec4(position.x, -position.y, position.z, position.w);
    v_texcoord = texcoord;
  }
`;

const COLOR_DEFICIENCY_SIMULATIONS: Record<ColorDeficiencySimulation, number> = {
  none: 0,
  protanopia: 1,
  deuteranopia: 2,
  tritanopia: 3,
  achromatopsia: 4,
};

const fragmentShader = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D u_texture;
  uniform vec2 u_unitDimension;
  uniform int u_colorDeficiencySimulation;

  vec3 mixPolyfill(in vec3 a, in vec3 b, in bvec3 c) {
    return vec3(
      c.x ? b.x : a.x,
      c.y ? b.y : a.y,
      c.z ? b.z : a.z
    );
  }

  // Conversion from linear-sRGB to special color space
  // [-0.01945, 1.34915, -0.3297]
  // [ 0.48055, 0.84915, -0.3297]
  // [-0.01945, 0.34915,  0.6703]
  const mat3 sRGBToTRH = mat3(
    -0.01945, 0.48055, -0.01945,
    1.34915, 0.84915, 0.34915,
    -0.3297, -0.3297, 0.6703
  );

  // Matrices taken from https://github.com/chromium/chromium/blob/136.0.7097.1/third_party/blink/renderer/core/css/vision_deficiency.cc
  // The filter color matrices are based on the following research paper:
  // Gustavo M. Machado, Manuel M. Oliveira, and Leandro A. F. Fernandes,
  // "A Physiologically-based Model for Simulation of Color Vision Deficiency".
  // IEEE Transactions on Visualization and Computer Graphics. Volume 15 (2009),
  // Number 6, November/December 2009. pp. 1291-1298.
  // https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
  //
  // The filter grayscale matrix is based on the following research paper:
  // Rang Man Ho Nguyen and Michael S. Brown,
  // "Why You Should Forget Luminance Conversion and Do Something Better".
  // IEEE Conference on Computer Vision and Pattern Recognition (CVPR),
  // Honolulu, HI, 2017. pp. 6750-6758.
  // https://openaccess.thecvf.com/content_cvpr_2017/papers/Nguyen_Why_You_Should_CVPR_2017_paper.pdf
  //
  // Note that GLSL matrices are in column-major order.
  const mat3 protanopiaMatrix = mat3(
     0.152,  0.115, -0.004,
     1.053,  0.786, -0.048,
    -0.205,  0.099,  1.052
  );
  const mat3 deuteranopiaMatrix = mat3(
     0.367,  0.280, -0.012,
     0.861,  0.673,  0.043,
    -0.228,  0.047,  0.969
  );
  const mat3 tritanopiaMatrix = mat3(
     1.256, -0.078,  0.005,
    -0.077,  0.931,  0.691,
    -0.179,  0.148,  0.304
  );
  const mat3 achromatopsiaMatrix = mat3(
     0.213,  0.213,  0.213,
     0.715,  0.715,  0.715,
     0.072,  0.072,  0.072
  );


  // Converts the point to the coordinate system
  // appropriate for the rhombitrihexagonal tessellation.
  //
  // Input coordinate:
  // - Input is in R^2.
  // - (0, 0) is the center of the first hexagon.
  // - (1, 0) is the center of the neighboring hexagon.
  //
  // Output coordinate:
  //
  // - Output is in R^2, where 0 <= y <= x <= 1.
  // - (0, 0) is the center of the hexagon.
  // - (1, 0) is the center of the square.
  // - (1, 1) is the center of the triangle.
  // - The line segment x = sqrt(3)/(1 + sqrt(3)) is
  //   half the edge of the hexagon neighboring the square.
  // - The line segment y = sqrt(3)/(1 + sqrt(3)) is
  //   half the edge of the triangle neighboring the square.
  vec2 rhombitrihexagonalCoord(in vec2 c) {
    c = mat2(
      1.0, 0.0,
      -0.5773502691896258, 1.1547005383792515
    ) * c;
    c = mod(c, 1.0);
    // Mirror c across the line x+y=1
    if (c.x + c.y > 1.0) {
      c = vec2(1.0) - c;
    }
    // Mirror c across the line y=x
    if (c.x < c.y) {
      c = vec2(c.y, c.x);
    }
    // Mirror c across the line x+2y=1 (but not orthogonally)
    if (c.x + 2.0 * c.y > 1.0) {
      c = vec2(c.x, 1.0 - c.x - c.y);
    }
    // Mirror c across the line 2x+y=1 (but not orthogonally)
    if (2.0 * c.x + c.y > 1.0) {
      c = vec2(1.0 - c.x - c.y, c.y);
    }
    c = vec2(c.x * 2.0 + c.y, c.y * 3.0);
    return c;
  }

  // Converts (R, G, B) in linear-sRGB color space to
  // (Y, u', v') in mixed XYZ + CIE 1976 UCS color space.
  //
  // Roughly:
  // - Y: brightness (0 - 1)
  // - u': more red than green (0.00 - 0.6x)
  // - v': more yellow than blue (0.0x - 0.5x)
  //
  // For sRGB,
  // - The red primary is (u', v') = (0.4507, 0.5229)
  // - The green primary is (u', v') = (0.1250, 0.5625)
  // - The blue primary is (u', v') = (0.1754, 0.1579)
  vec3 srgbToYuv(in vec3 srgb) {
    vec3 xyz = mat3(
      0.4124564, 0.2126729, 0.0193339,
      0.3575761, 0.7151522, 0.1191920,
      0.1804375, 0.0721750, 0.9503041
    ) * srgb;
    float denominator = xyz.x + 15.0 * xyz.y + 3.0 * xyz.z;
    float u = 4.0 * xyz.x / denominator;
    float v = 9.0 * xyz.y / denominator;
    return vec3(xyz.y, u, v);
  }

  // (u', v') of the D65 white point
  const vec2 whiteUV = vec2(0.1978398, 0.4683363);

  // Adjust components within the same brightness so that the values are in the range.
  void preferBrightness(inout vec3 color) {
    float brightness = min(dot(color, vec3(0.2126, 0.7152, 0.0722)), 1.0);
    // The result should be in the form of vec3(brightness) + scalar * chroma.
    vec3 chroma = color - vec3(brightness);
    vec3 componentFactors = mixPolyfill(
      vec3(1.0),
      min(
        vec3(1.0 - brightness) / chroma,
        vec3(1.0)
      ),
      lessThan(vec3(0.0), chroma)
    );
    float factor = min(min(componentFactors.x, componentFactors.y), componentFactors.z);
    color = vec3(brightness) + factor * chroma;
  }

  void main() {
    // Color
    vec4 inputColor = texture2D(u_texture, v_texcoord);
    vec3 yuv = srgbToYuv(inputColor.rgb);
    vec2 relUV = yuv.yz - whiteUV;

    // Coordinates
    vec2 unitCoord = v_texcoord * u_unitDimension;
    vec2 c = unitCoord;
    c = rhombitrihexagonalCoord(c);

    // Split the triangle in sqrt(3) : 1 ratio in each axis
    // resulting in 3 : 2sqrt(3) : 1 ratio area-wise.

    float inTriangle = smoothstep(0.62, 0.64, c.y);
    float inHexagon = 1.0 - smoothstep(0.62, 0.64, c.x);
    vec2 placeFactor = vec2(
      // Area ratio: 1 : 2sqrt(3)
      inTriangle - 0.2240,
      // Area ratio: 3 : 2sqrt(3)
      inHexagon - 0.4641
    );
    float brightnessAdjust = 1.0 + 4.0 * dot(placeFactor, relUV * vec2(-1, 1));
    float currentBrightness = yuv.x;
    float targetBrightness = currentBrightness * brightnessAdjust;
    vec3 outputColor3 = inputColor.rgb * targetBrightness / currentBrightness;
    preferBrightness(outputColor3);

    // Apply the color deficiency matrix
    if (u_colorDeficiencySimulation == 0) {
      // No transformation
    } else if (u_colorDeficiencySimulation == 1) {
      outputColor3 = protanopiaMatrix * outputColor3;
    } else if (u_colorDeficiencySimulation == 2) {
      outputColor3 = deuteranopiaMatrix * outputColor3;
    } else if (u_colorDeficiencySimulation == 3) {
      outputColor3 = tritanopiaMatrix * outputColor3;
    } else if (u_colorDeficiencySimulation == 4) {
      outputColor3 = achromatopsiaMatrix * outputColor3;
    }
    gl_FragColor = vec4(outputColor3, inputColor.a);
  }
`;
