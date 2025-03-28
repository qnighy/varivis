import { Dispatch, ReactElement } from "react";
import { Action, CameraOptionData } from "./state";

export type CameraSelectorProps = {
  cameraList: CameraOptionData[];
  selectedCameraOptionId: string;
  dispatch: Dispatch<Action>;
};

export function CameraSelector(props: CameraSelectorProps): ReactElement | null {
  const { cameraList, selectedCameraOptionId, dispatch } = props;

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
