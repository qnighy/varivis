import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useReducer } from "react";
import { CameraSelector } from "./CameraSelector.js";
import { CameraStartToggle } from "./CameraStartToggle.js";
import { CameraBody } from "./CameraBody.js";
import {
  initialState,
  reducer,
  getCameraList,
  getCheckedSelectedCameraId,
  getActiveCameraOptionId,
  initCameraList,
} from "./state.js";

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
    // <div>
    jsxs("div", {
      children: [
        // <CameraSelector
        jsx(CameraSelector, {
          // cameraList={cameraList}
          cameraList,
          // selectedCameraOptionId={selectedCameraOptionId}
          selectedCameraOptionId,
          // dispatch={dispatch}
          dispatch,
        }),
        // />
        // <CameraStartToggle
        jsx(CameraStartToggle, {
          // selectedCameraOptionId={selectedCameraOptionId}
          selectedCameraOptionId,
          // activeCameraOptionId={activeCameraOptionId}
          activeCameraOptionId,
          // dispatch={dispatch}
          dispatch,
        }),
        // />
        // <br />
        jsx("br", {}),
        // <CameraBody key={activeCameraOptionId}
        jsx(CameraBody, {
          // activeCameraOptionId={activeCameraOptionId}
          activeCameraOptionId,
          // dispatch={dispatch}
          dispatch,
        }, activeCameraOptionId),
        // />
      ],
    })
    // </div>
  );
}
