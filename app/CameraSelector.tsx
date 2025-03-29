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
      className="w-full h-12 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {cameraList.map((camera) => (
        <option
          key={camera.cameraOptionId}
          value={camera.cameraOptionId}
          className="text-gray-700 hover:bg-blue-100 focus:bg-blue-200"
        >
          {camera.label}
        </option>
      ))}
    </select>
  );
}
