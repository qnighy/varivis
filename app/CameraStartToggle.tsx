// @ts-nocheck
import { jsx } from "react/jsx-runtime";

export function CameraStartToggle(props) {
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
    // <button
    jsx("button", {
      // onClick={onClick}
      onClick: onClick,
      // >
      children: started ? "Stop Camera" : "Start Camera",
    })
    // </button>
  );
}
