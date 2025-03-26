import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import * as twgl from "twgl.js";

export function CameraBody(props) {
  const { activeCameraOptionId, dispatch } = props;

  const video = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    if (activeCameraOptionId != null && video.current && canvas.current) {
      const controller = new AbortController();
      const signal = controller.signal;
      runCamera({
        cameraOptionId: activeCameraOptionId,
        video: video.current,
        canvas: canvas.current,
        signal,
        onInitCamera: () => {
          dispatch({ type: "reloadCameraList" });
        },
      })
        .catch((e) => {
          if (!signal.aborted || e.name !== "AbortError") {
            console.error(e);
            toast(`${e}`, { type: "error" });
          }
        });
      return () => controller.abort();
    }
  }, [activeCameraOptionId, video.current, canvas.current]);

  return (
    // <>
    jsxs(Fragment, {
      children: [
        // <video
        jsx("video", {
          // style={{ display: "none" }}
          style: { display: "none" },
          // muted={true}
          muted: true,
          // playsInline={true}
          playsInline: true,
          // ref={video}
          ref: video,
          // />
        }),
        // <div
        jsx("div", {
          // className="camera-output-wrapper"
          className: "camera-output-wrapper",
          children:
            // <canvas
            jsx("canvas", {
              // className="camera-output"
              className: "camera-output",
              // ref={canvas}
              ref: canvas,
              // />
            }),
        }),
        // </div>
      ],
    })
    // </>
  );
}

async function runCamera(options) {
  const {
    cameraOptionId,
    video,
    canvas,
    signal,
    onInitCamera,
  } = options;

  await initCamera();
  onInitCamera?.();
  const { gl, programInfo, bufferInfo, texture } = initGL();
  while (true) {
    ensureNotAborted(signal);
    await animationFrame();
    ensureNotAborted(signal);
    updateFrame();
  }

  async function initCamera() {
    ensureNotAborted(signal);
    const videoConstraints = {};
    if (cameraOptionId.startsWith("deviceId:")) {
      const deviceId = cameraOptionId.slice("deviceId:".length);
      videoConstraints.deviceId = { exact: deviceId };
    } else {
      videoConstraints.facingMode = { ideal: "environment" };
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false
    });
    video.srcObject = stream;
    ensureNotAborted(signal);
    await video.play();
    onAbort(signal, () => {
      stream.getTracks().forEach((track) => track.stop());
    });
  }

  function initGL() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL 2.0 not supported in this browser.");
    }
    
    const programInfo = twgl.createProgramInfo(gl, [getVertexShader(), getFragmentShader()]);
    const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);
    const blue = [0, 0, 255, 255];
    const texture = twgl.createTexture(gl, {
      src: blue,
      min: gl.LINEAR,
      mag: gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
    });
    return { gl, programInfo, bufferInfo, texture };
  }

  function getVertexShader() {
    return `
      attribute vec4 position;
      attribute vec2 texcoord;
      varying vec2 v_texcoord;

      void main() {
        // Flip position vertically (but not horizontally)
        gl_Position = vec4(position.x, -position.y, position.z, position.w);
        v_texcoord = texcoord;
      }
    `;
  }

  function getFragmentShader() {
    return `
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
  }

  function updateFrame() {
    // If the video is ready, update the texture
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      // Update the texture with the current video frame
      twgl.setTextureFromElement(gl, texture, video);
    }

    // Adjust viewport/canvas size if needed
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use our program and buffers
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    // Set uniforms (the texture)
    const canvasSize = Math.min(canvas.width, canvas.height);
    const unitSize = canvasSize / 30;
    const uniforms = {
      u_texture: texture,
      u_unitDimension: [canvas.width / unitSize, canvas.height / unitSize],
    };
    twgl.setUniforms(programInfo, uniforms);

    // Draw!
    twgl.drawBufferInfo(gl, bufferInfo);
  }
}

function ensureNotAborted(signal, msg = "Aborted") {
  if (signal.aborted) {
    throw new DOMException(msg, "AbortError");
  }
}
function onAbort(signal, callback) {
  if (signal.aborted) {
    callback();
  } else {
    signal.addEventListener("abort", callback, { once: true });
  }
}
function animationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
