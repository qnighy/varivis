// @ts-nocheck
import { toast } from "react-toastify";

export const initialState = {
  rawCameraListState: "initial",
  rawCameraList: [],
  selectedCameraOptionId: "default",
  startRequested: false,
};

export function reducer(state, action) {
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

export function getCameraList(state) {
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

export function getCheckedSelectedCameraId(state) {
  const cameraList = getCameraList(state);
  if (cameraList.some((c) => c.cameraOptionId === state.selectedCameraOptionId)) {
    return state.selectedCameraOptionId;
  } else {
    return "default";
  }
}

export function getActiveCameraOptionId(state) {
  return state.startRequested ? getCheckedSelectedCameraId(state) : null;
}

export function initCameraList(dispatch) {
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
