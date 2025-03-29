import { Dispatch, ReactElement } from "react";
import { Action, ColorDeficiencySimulation, State } from "./state";

export type ColorDeficiencySimulatorSelector = {
  state: State;
  dispatch: Dispatch<Action>;
};

const COLOR_DEFICIENCY_SIMULATIONS: {
  label: string;
  value: ColorDeficiencySimulation;
}[] = [
  { label: "No emulation", value: "none" },
  { label: "Protanopia (no red)", value: "protanopia" },
  { label: "Deuteranopia (no green)", value: "deuteranopia" },
  { label: "Tritanopia (no blue)", value: "tritanopia" },
  { label: "Achromatopsia (no color)", value: "achromatopsia" },
];

export function ColorDeficiencySimulatorSelector(props: ColorDeficiencySimulatorSelector): ReactElement | null {
  const { state, dispatch } = props;

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;
    if (!COLOR_DEFICIENCY_SIMULATIONS.some((simulation) => simulation.value === value)) {
      throw new TypeError(`Invalid color deficiency simulation: ${value}`);
    }
    dispatch({ type: "setColorDeficiencySimulation", payload: { simulation: value as ColorDeficiencySimulation } });
  };

  return (
    <select
      onChange={onChange}
      value={state.colorDeficiencySimulation}
      className="w-full h-12 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {COLOR_DEFICIENCY_SIMULATIONS.map((simulation) => (
        <option
          key={simulation.value}
          value={simulation.value}
          className="text-gray-700 hover:bg-blue-100 focus:bg-blue-200"
        >
          {simulation.label}
        </option>
      ))}
    </select>
  );
}
