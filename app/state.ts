import { Dispatch } from "react";
import { toast } from "react-toastify";

export type State = {
  rawCameraListState: "initial" | "loading" | "loaded" | "failed";
  rawCameraList: MediaDeviceInfoObj[];
  selectedCameraOptionId: string;
  startRequested: boolean;
};

export type MediaDeviceInfoObj = {
  kind: string;
  label: string;
  deviceId: string;
  groupId: string;
}

export const initialState: State = {
  rawCameraListState: "initial",
  rawCameraList: [],
  selectedCameraOptionId: "default",
  startRequested: false,
};

export type Action =
  | { type: "initCameraList/start" }
  | { type: "initCameraList/success"; payload: { rawCameraList: MediaDeviceInfoObj[] } }
  | { type: "initCameraList/failure"; payload: {} }
  | { type: "reloadCameraList" }
  | { type: "selectCamera"; payload: { deviceId: string } }
  | { type: "startCamera" }
  | { type: "stopCamera" };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "initCameraList/start":
      return { ...state, rawCameraListState: "loading" };
    case "initCameraList/success":
      return {
        ...state,
        rawCameraListState: "loaded",
        rawCameraList: action.payload.rawCameraList,
      };
    case "initCameraList/failure":
      return { ...state, rawCameraListState: "failed" };
    case "reloadCameraList":
      return { ...state, rawCameraListState: "initial" };
    case "selectCamera":
      return { ...state, selectedCameraOptionId: action.payload.deviceId };
    case "startCamera":
      return { ...state, startRequested: true };
    case "stopCamera":
      return { ...state, startRequested: false };
    default:
      return state;
  }
}

export type CameraOptionData = {
  label: string;
  cameraOptionId: string;
};

export function getCameraList(state: State): CameraOptionData[] {
  return [
    {
      label: "Default Camera",
      cameraOptionId: "default",
    },
    ...state.rawCameraList.map((camera) => ({
      label: camera.label,
      cameraOptionId: `deviceId:${camera.deviceId}`,
    })),
  ]
}

export function getCheckedSelectedCameraId(state: State): string {
  const cameraList = getCameraList(state);
  if (cameraList.some((c) => c.cameraOptionId === state.selectedCameraOptionId)) {
    return state.selectedCameraOptionId;
  } else {
    return "default";
  }
}

export function getActiveCameraOptionId(state: State): string | null {
  return state.startRequested ? getCheckedSelectedCameraId(state) : null;
}

export function initCameraList(dispatch: Dispatch<Action>): void {
  (async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((d) => d.kind === "videoinput").map((d) => ({
      kind: d.kind,
      label: d.label,
      deviceId: d.deviceId,
      groupId: d.groupId,
    }));
    dispatch({ type: "initCameraList/success", payload: { rawCameraList: cameras } });
  })().catch((e) => {
    dispatch({ type: "initCameraList/failure", payload: {} });
    console.error(e);
    toast(`Failed to initialize camera list: ${e}`, { type: "error" });
  });
}
