// @ts-nocheck

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
    <button onClick={onClick}>
      {started ? "Stop Camera" : "Start Camera"}
    </button>
  );
}
