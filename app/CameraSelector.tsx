// @ts-nocheck
import { jsx } from "react/jsx-runtime";

export function CameraSelector(props) {
  const { cameraList, selectedCameraOptionId, dispatch } = props;

  const onChange = (e) => {
    dispatch({ type: "selectCamera", payload: { deviceId: e.currentTarget.value } });
  };
  
  return (
    // <select
    jsx("select", {
      // onChange={onChange}
      onChange: onChange,
      // value={selectedCameraOptionId}
      value: selectedCameraOptionId,
      // >
      children: cameraList.map((camera) => (
        // <option key={camera.cameraOptionId}
        jsx("option", {
          // value={camera.cameraOptionId}
          value: camera.cameraOptionId,
          // selected={camera.cameraOptionId === selectedCameraOptionId}
          selected: camera.cameraOptionId === selectedCameraOptionId,
          // >
          // {camera.label}
          children: camera.label,
        }, camera.cameraOptionId)
        // </option>
      )),
    })
    // </select>
  );
}
