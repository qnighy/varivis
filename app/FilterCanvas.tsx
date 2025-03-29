import { ForwardedRef, forwardRef, ReactElement, useEffect, useImperativeHandle, useRef } from "react";
import * as twgl from "twgl.js";

export type FilterCanvasProps = {
  className?: string;
  style?: React.CSSProperties;
};
export type FilterCanvasHandle = {
  element: HTMLCanvasElement;
  update: (element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement) => void;
};

function FilterCanvas(props: FilterCanvasProps, ref: ForwardedRef<FilterCanvasHandle>): ReactElement | null {
  const { className, style } = props;

  const elemRef = useRef<HTMLCanvasElement>(null);
  const renderContext = useRef<RenderContext | null>(null);
  useEffect(() => {
    if (elemRef.current) {
      renderContext.current = new RenderContext(elemRef.current);
    }
  }, []);
  useImperativeHandle(ref, () => ({
    element: elemRef.current!,
    update: (element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement) => {
      renderContext.current?.update(element);
    },
  }), []);
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

class RenderContext {
  #canvas: HTMLCanvasElement;
  #gl: WebGL2RenderingContext;
  #programInfo: twgl.ProgramInfo;
  #bufferInfo: twgl.BufferInfo;
  #texture: WebGLTexture;

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
  }

  update(element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement) {
    const { width, height } =
      element instanceof HTMLVideoElement
        ? { width: element.videoWidth, height: element.videoHeight }
        : element;
    this.#canvas.width = width;
    this.#canvas.height = height;
    // If the video is ready, update the texture
    if (element instanceof HTMLVideoElement && element.readyState >= element.HAVE_CURRENT_DATA) {
      // Update the texture with the current video frame
      twgl.setTextureFromElement(this.#gl, this.#texture, element);
    }

    // Adjust viewport/canvas size if needed
    // twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    this.#gl.viewport(0, 0, width, height);

    // Clear the canvas
    this.#gl.clearColor(0, 0, 0, 1);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

    // Use our program and buffers
    this.#gl.useProgram(this.#programInfo.program);
    twgl.setBuffersAndAttributes(this.#gl, this.#programInfo, this.#bufferInfo);

    // Set uniforms (the texture)
    const canvasSize = Math.min(width, height);
    const unitSize = canvasSize / 30;
    const uniforms = {
      u_texture: this.#texture,
      u_unitDimension: [width / unitSize, height / unitSize],
    };
    twgl.setUniforms(this.#programInfo, uniforms);

    // Draw!
    twgl.drawBufferInfo(this.#gl, this.#bufferInfo);
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

const fragmentShader = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D u_texture;
  uniform vec2 u_unitDimension;
  // Conversion from linear-sRGB to special color space
  // [-0.01945, 1.34915, -0.3297]
  // [ 0.48055, 0.84915, -0.3297]
  // [-0.01945, 0.34915,  0.6703]
  const mat3 sRGBToTRH = mat3(
    -0.01945, 0.48055, -0.01945,
    1.34915, 0.84915, 0.34915,
    -0.3297, -0.3297, 0.6703
  );


  void main() {
    vec4 color = texture2D(u_texture, v_texcoord);
    vec3 trhColor = sRGBToTRH * color.rgb;
    vec2 unitCoord = v_texcoord * u_unitDimension;
    vec2 c = unitCoord;
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

    // Split the triangle in sqrt(3) : 1 ratio in each axis
    // resulting in 3 : 2sqrt(3) : 1 ratio area-wise.

    float inTriangle = smoothstep(0.62, 0.64, c.y);
    float inHexagon = 1.0 - smoothstep(0.62, 0.64, c.x);
    vec3 trhRatio = vec3(
      inTriangle,
      1.0 - inTriangle - inHexagon,
      inHexagon
    );
    float targetBrightness = dot(trhColor, trhRatio);
    float currentBrightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor = vec4(color.rgb * targetBrightness / currentBrightness, color.a);
  }
`;
