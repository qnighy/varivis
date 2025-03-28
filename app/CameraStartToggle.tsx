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
    <button onClick={onClick}>
      {started ? "Stop Camera" : "Start Camera"}
    </button>
  );
}
