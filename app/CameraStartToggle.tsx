import { Dispatch, ReactElement } from "react";
import { Action } from "./state";

export type CameraStartToggleProps = {
  selectedCameraOptionId: string;
  activeCameraOptionId: string | null;
  dispatch: Dispatch<Action>;
};

export function CameraStartToggle(props: CameraStartToggleProps): ReactElement | null {
  const { activeCameraOptionId, dispatch } = props;

  const started = activeCameraOptionId != null;
  const onClick = () => {
    if (activeCameraOptionId) {
      dispatch({ type: "stopCamera" });
    } else {
      dispatch({ type: "startCamera" });
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full h-12 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {started ? "Stop Camera" : "Start Camera"}
    </button>
  );
}
