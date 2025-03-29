import { Dispatch, ReactElement, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Action } from "./state";
import { FilterCanvas, FilterCanvasHandle } from "./FilterCanvas";

export type CameraBodyProps = {
  activeCameraOptionId: string | null;
  dispatch: Dispatch<Action>;
};

export function CameraBody(props: CameraBodyProps): ReactElement | null {
  const { activeCameraOptionId, dispatch } = props;

  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<FilterCanvasHandle>(null);

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
  }, [activeCameraOptionId, dispatch]);

  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen"
    >
      <div
        className="absolute top-0 left-0 w-screen h-screen opacity-0"
      >
        <video
          style={{ display: "none" }}
          muted={true}
          playsInline={true}
          ref={video}
          className="w-screen h-screen"
        />
      </div>
      <div className="absolute top-0 left-0 flex w-screen h-screen z-0">
        <FilterCanvas
          className="object-contain w-screen h-screen"
          ref={canvas}
        />
      </div>
    </div>
  );
}

type RunCameraOptions = {
  cameraOptionId: string;
  video: HTMLVideoElement;
  canvas: FilterCanvasHandle;
  signal: AbortSignal;
  onInitCamera?: () => void;
};

async function runCamera(options: RunCameraOptions): Promise<void> {
  const {
    cameraOptionId,
    video,
    canvas,
    signal,
    onInitCamera,
  } = options;

  await initCamera();
  onInitCamera?.();
  while (true) {
    ensureNotAborted(signal);
    await animationFrame();
    ensureNotAborted(signal);
    canvas.update(video);
  }

  async function initCamera() {
    ensureNotAborted(signal);
    const videoConstraints: MediaTrackConstraints = {};
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
}

function ensureNotAborted(signal: AbortSignal, msg = "Aborted") {
  if (signal.aborted) {
    throw new DOMException(msg, "AbortError");
  }
}
function onAbort(signal: AbortSignal, callback: () => void) {
  if (signal.aborted) {
    callback();
  } else {
    signal.addEventListener("abort", callback, { once: true });
  }
}
function animationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
