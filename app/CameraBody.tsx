import { Dispatch, ReactElement, RefObject, useEffect } from "react";
import { toast } from "react-toastify";
import { Action } from "./state";
import { FilterCanvasHandle } from "./FilterCanvas";

export type CameraBodyProps = {
  activeCameraOptionId: string | null;
  canvas: RefObject<FilterCanvasHandle | null>;
  dispatch: Dispatch<Action>;
};

export function CameraBody(props: CameraBodyProps): ReactElement | null {
  const { activeCameraOptionId, dispatch, canvas } = props;

  useEffect(() => {
    if (activeCameraOptionId != null && canvas.current) {
      const controller = new AbortController();
      const signal = controller.signal;
      runCamera({
        cameraOptionId: activeCameraOptionId,
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
  }, [activeCameraOptionId, dispatch, canvas]);

  return null;
}

type RunCameraOptions = {
  cameraOptionId: string;
  canvas: FilterCanvasHandle;
  signal: AbortSignal;
  onInitCamera?: () => void;
};

async function runCamera(options: RunCameraOptions): Promise<void> {
  const {
    cameraOptionId,
    canvas,
    signal,
    onInitCamera,
  } = options;

  using stream = await initStream();
  onInitCamera?.();
  const video = await initVideoElement(stream.value);

  while (true) {
    ensureNotAborted(signal);
    await animationFrame();
    ensureNotAborted(signal);
    canvas.update(video);
  }

  async function initStream(): Promise<DisposableMediaStream> {
    const videoConstraints: MediaTrackConstraints = {};
    if (cameraOptionId.startsWith("deviceId:")) {
      const deviceId = cameraOptionId.slice("deviceId:".length);
      videoConstraints.deviceId = { exact: deviceId };
    } else {
      videoConstraints.facingMode = { ideal: "environment" };
    }
    ensureNotAborted(signal);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false
    });
    return new DisposableMediaStream(stream);
  }

  async function initVideoElement(stream: MediaStream): Promise<HTMLVideoElement> {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    ensureNotAborted(signal);
    await video.play();
    ensureNotAborted(signal);
    return video;
  }
}

class DisposableMediaStream {
  readonly value: MediaStream;

  constructor(stream: MediaStream) {
    this.value = stream;
  }

  [Symbol.dispose]() {
    for (const track of this.value.getTracks()) {
      track.stop();
    }
  }
}

function ensureNotAborted(signal: AbortSignal, msg = "Aborted") {
  if (signal.aborted) {
    throw new DOMException(msg, "AbortError");
  }
}
function animationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
