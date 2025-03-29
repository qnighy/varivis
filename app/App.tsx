import { useEffect, useReducer, useRef } from "react";
import { CameraSelector } from "./CameraSelector";
import { CameraStartToggle } from "./CameraStartToggle";
import { CameraBody } from "./CameraBody";
import {
  initialState,
  reducer,
  getCameraList,
  getCheckedSelectedCameraId,
  getActiveCameraOptionId,
  initCameraList,
} from "./state";
import { FilterCanvas, FilterCanvasHandle } from "./FilterCanvas";

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const cameraList = getCameraList(state);
  const selectedCameraOptionId = getCheckedSelectedCameraId(state);
  const activeCameraOptionId = getActiveCameraOptionId(state);

  const mainCanvas = useRef<FilterCanvasHandle>(null);

  useEffect(() => {
    if (state.rawCameraListState === "initial") {
      initCameraList(dispatch);
    }
  }, [dispatch, state.rawCameraListState]);
  useEffect(() => {
    const listener = () => {
      dispatch({ type: "reloadCameraList" });
    };
    navigator.mediaDevices.addEventListener("devicechange", listener);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", listener);
    };
  }, [dispatch]);

  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100"
    >
      <CameraBody key={activeCameraOptionId}
        activeCameraOptionId={activeCameraOptionId}
        dispatch={dispatch}
        canvas={mainCanvas}
      />
      <div className="absolute top-0 left-0 flex w-screen h-screen z-0">
        <FilterCanvas
          className="object-contain w-screen h-screen"
          ref={mainCanvas}
        />
      </div>
      <div
        className="flex flex-col items-center justify-center w-full max-w-xs p-4 bg-white border border-gray-300 rounded-md shadow-md z-10"
      >
        <CameraSelector
          cameraList={cameraList}
          selectedCameraOptionId={selectedCameraOptionId}
          dispatch={dispatch}
        />
        <CameraStartToggle
          selectedCameraOptionId={selectedCameraOptionId}
          activeCameraOptionId={activeCameraOptionId}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}
