import { atom } from "recoil";

export const searchState = atom({
  key: "searchState",
  default: [],
});

export const allDropDownData = atom({
  key: "allDropDownData",
  default: {
    SystemInfo: {},
    ProcessorInfo: {},
    MemoryInfo: {},
    StorageDisksInfo: {},
    StorageControllersInfo: {},
    NetworkDevicesInfo: {},
    PowerSuppliesInfo: {},
    BackplaneInfo: {},
  },
});
