import { Dispatch, ReactElement } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Action, CameraOptionData } from "./state";
import { CameraSelector } from "./CameraSelector";
import { Config, SetConfig } from "./useConfig";

export type NavbarProps = {
  cameraList: CameraOptionData[];
  selectedCameraOptionId: string;
  config: Config,
  setConfig: SetConfig;
  dispatch: Dispatch<Action>;
};

export function Navbar(props: NavbarProps): ReactElement | null {
  const { cameraList, selectedCameraOptionId, config, setConfig, dispatch } = props;

  return (
    <Disclosure as="nav" className="bg-gray-200 self-start w-full h-16 fixed top-0 z-10">
      {({ open }) => (
        <>
          {/* Main navigation container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Desktop navigation links */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                <CameraSelector
                  cameraList={cameraList}
                  selectedCameraOptionId={selectedCameraOptionId}
                  dispatch={dispatch}
                />
                <label
                  className="w-full h-12 block text-gray-700 text-sm font-bold mb-2"
                >
                  <input
                    type="checkbox"
                    checked={config.autoStart}
                    onChange={(e) => setConfig((config) => ({ ...config, autoStart: e.target.checked }))}
                    className="ml-4"
                  />
                  Start the camera automatically
                </label>
              </div>
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <DisclosurePanel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <CameraSelector
                cameraList={cameraList}
                selectedCameraOptionId={selectedCameraOptionId}
                dispatch={dispatch}
              />
              <label
                className="w-full h-12 block text-gray-700 text-sm font-bold mb-2"
              >
                <input
                  type="checkbox"
                  checked={config.autoStart}
                  onChange={(e) => setConfig((config) => ({ ...config, autoStart: e.target.checked }))}
                  className="ml-4"
                />
                Start the camera automatically
              </label>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
