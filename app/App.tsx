import { useEffect, useReducer, useRef } from "react";
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
import { Navbar } from "./Navbar";
import { StartScreen } from "./StartScreen";

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
    <>
      <CameraBody key={activeCameraOptionId}
        activeCameraOptionId={activeCameraOptionId}
        dispatch={dispatch}
        canvas={mainCanvas}
      />
      <div className="flex flex-col w-screen h-screen">
        <Navbar
          cameraList={cameraList}
          selectedCameraOptionId={selectedCameraOptionId}
          dispatch={dispatch}
        />
        <div className="flex flex-col justify-center justify-items-center flex-grow">
          {
            !state.startRequested &&
              <StartScreen dispatch={dispatch} />
          }
          {
            state.startRequested &&
              <FilterCanvas
                className="object-contain w-full h-full"
                ref={mainCanvas}
              />
          }
        </div>
      </div>
    </>
  );
}
