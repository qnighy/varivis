import { useEffect, useReducer } from "react";
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

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const cameraList = getCameraList(state);
  const selectedCameraOptionId = getCheckedSelectedCameraId(state);
  const activeCameraOptionId = getActiveCameraOptionId(state);

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
    <div>
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
      <br />
      <CameraBody key={activeCameraOptionId}
        activeCameraOptionId={activeCameraOptionId}
        dispatch={dispatch}
      />
    </div>
  );
}
