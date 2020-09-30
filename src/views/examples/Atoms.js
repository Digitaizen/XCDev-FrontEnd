import { atom } from "recoil";

export const searchState = atom({
  key: "searchState",
  default: [],
});

export const allSearchData = atom({
  key: "allSearchData",
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
