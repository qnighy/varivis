import { Dispatch, useEffect, useReducer, useRef } from "react";
import { CameraBody } from "./CameraBody";
import { Config, useConfig } from "./useConfig";
import {
  initialState,
  reducer,
  getCameraList,
  getCheckedSelectedCameraId,
  getActiveCameraOptionId,
  initCameraList,
  Action,
} from "./state";
import { FilterCanvas, FilterCanvasHandle } from "./FilterCanvas";
import { Navbar } from "./Navbar";
import { StartScreen } from "./StartScreen";
import { FilterImage } from "./FilterImage";
import colorComparisonImage from "./color-comparison.png";

export function App() {
  const { isConfigLoading, config, setConfig } = useConfig();
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

  useAutoStart({
    isConfigLoading,
    config,
    dispatch,
  });

  return (
    <>
      <CameraBody key={activeCameraOptionId}
        activeCameraOptionId={activeCameraOptionId}
        dispatch={dispatch}
        canvas={mainCanvas}
      />
      <div className="flex flex-col w-screen h-screen">
        <Navbar
          state={state}
          cameraList={cameraList}
          selectedCameraOptionId={selectedCameraOptionId}
          config={config}
          setConfig={setConfig}
          dispatch={dispatch}
        />
        <div className="flex flex-col justify-center justify-items-center flex-grow">
          {
            !state.startRequested &&
              <StartScreen dispatch={dispatch} />
          }
          {
            state.startRequested &&
              <>
                <FilterCanvas
                  className="object-contain w-full flex-grow"
                  colorDeficiencySimulation={state.colorDeficiencySimulation}
                  ref={mainCanvas}
                />
                <FilterImage
                  src={colorComparisonImage.src}
                  width={colorComparisonImage.width}
                  height={colorComparisonImage.height}
                  colorDeficiencySimulation={state.colorDeficiencySimulation}
                />
              </>
          }
        </div>
      </div>
    </>
  );
}

type UseAutoStartParams = {
  isConfigLoading: boolean;
  config: Config;
  dispatch: Dispatch<Action>;
};
function useAutoStart(params: UseAutoStartParams) {
  const { isConfigLoading, config, dispatch } = params;
  const isAutoStartProcessed = useRef<boolean>(false);

  useEffect(() => {
    if (isConfigLoading) {
      return;
    }
    if (!isAutoStartProcessed.current) {
      isAutoStartProcessed.current = true;
      if (config.autoStart) {
        dispatch({ type: "startCamera" });
      }
    }
  }, [isConfigLoading, config.autoStart, dispatch]);
}
