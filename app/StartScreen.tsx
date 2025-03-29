import { Dispatch, ReactElement } from "react";
import { Action } from "./state";
import { CameraIcon } from "@heroicons/react/24/outline";

export type StartScreenProps = {
  dispatch: Dispatch<Action>;
};

export function StartScreen(props: StartScreenProps): ReactElement | null {
  const { dispatch } = props;

  const onClick = () => {
    dispatch({ type: "startCamera" });
  };

  return (
    <div className="flex flex-col justify-center">
      <h1 className="text-2xl font-bold text-center mb-4">
        Väri Vis!
      </h1>
      <p className="mb-4 mx-4">
        <strong className="text-blue-500">Väri Vis!</strong>
        {" "}
        is a camera app with a special filter
        to emphasize colors using monochromatic patterns,
        primarily for colorblind users.
      </p>
      <button
        onClick={onClick}
        className="w-48 h-12 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 self-center"
      >
        <CameraIcon
          className="w-6 h-6 inline-block mr-2"
          aria-hidden="true"
        />
        Start Camera
      </button>
    </div>
  );
}

