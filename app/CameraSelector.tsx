// @ts-nocheck

export function CameraSelector(props) {
  const { cameraList, selectedCameraOptionId, dispatch } = props;

  const onChange = (e) => {
    dispatch({ type: "selectCamera", payload: { deviceId: e.currentTarget.value } });
  };
  
  return (
    <select
      onChange={onChange}
      value={selectedCameraOptionId}
    >
      {cameraList.map((camera) => (
        <option
          key={camera.cameraOptionId}
          value={camera.cameraOptionId}
          selected={camera.cameraOptionId === selectedCameraOptionId}
        >
          {camera.label}
        </option>
      ))}
    </select>
  );
}
