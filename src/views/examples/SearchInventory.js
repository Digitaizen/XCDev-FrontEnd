import React, { useState, useEffect } from "react";
import Select from "react-select";

import {
  useTable,
  useRowSelect,
  useSortBy,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  usePagination,
} from "react-table";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import * as dotLoading from "../../components/Loading/dotLoading.json";
import matchSorter from "match-sorter";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  Table,
  Container,
  Col,
  Row,
  CardFooter,
  Pagination,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import Form from "react-bootstrap/Form";
import axios from "axios";

// core components
import Header from "../../components/Headers/Header.js";
import { useRecoilState } from "recoil";
import { searchState, allDropDownData } from "./Atoms";

const apiServer = process.env.REACT_APP_API_SERVER;

// Flag that indicates if Search Values are empty or not
let searchEmpty = true;

// Create main array to store server objects data
let allServerObj = [];

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      Search:{" "}
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
          border: "0",
        }}
      />
    </span>
  );
}

// Define a default filtering method
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

// Function that returns data size in short, human-readable format. Input: data size in bytes.
function formatSize(bytes, roundOff) {
  // console.log("Before formating: " + bytes); //debugging
  let converted;
  if (typeof bytes === "number") {
    const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let l = 0,
      n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    };
    if (roundOff)
      converted = Math.round(n.toFixed(n < 10 && l > 0 ? 1 : 0)) + " " + units[l];
    else
      converted = n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
  } else {
    converted = bytes;
  };
  // console.log("after formating: " + converted); //debugging
  return converted;


  // var neg = bytes < 0;
  // var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  // if (neg) bytes = -bytes;
  // if (bytes < 1) return (neg ? '-' : '') + bytes + ' B';
  // var exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
  // bytes = Math.round(Number((bytes / Math.pow(1000, exponent)).toFixed(2)));
  // var unit = units[exponent];
  // return (neg ? '-' : '') + bytes + ' ' + unit;
}

// Function to check the existence of a key in an object
function keyExists(obj, key) {
  let val;
  let objKeys = Object.keys(obj);
  objKeys.includes(key) ? (val = true) : (val = false);
  return val;
}

// Function to resize a textarea box to match its content size
function ResizeTextArea(id) {
  let taHeight = "";
  taHeight = document.getElementById(id).scrollHeight;
  document.getElementById(id).style.height = taHeight + "px";
}

// Make comments section editable field
const EditableComments = ({
  value: initialValue,
  row,
  column: { id },
  updateMyData,
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  // Set 'initialValue' to value read upon cell focus event
  const onFocus = (e) => {
    initialValue = e.target.value;
    // set height of textarea to display the full comment
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // Set table cell's value upon input
  const onChange = (e) => {
    setValue(e.target.value);
    // reset height of textarea to match display of the full comment being entered
    e.target.style.height = "";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
    // Call function to resize textarea's height to display full comment
    ResizeTextArea("ta" + row.id);
  }, [initialValue, row.id]);

  //Write new comment string to database upon user leaving the table cell entry
  const onBlur = () => {
    updateMyData(row.index, id, value);
    if (value === initialValue) {
      return;
    } else {
      // Specify request options
      const requestOptions = {
        method: "PATCH",
        body: JSON.stringify({ comments: value }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };

      // Now fetch it to the backend API
      fetch(`${apiServer}/patchComments/${row.original._id}`, requestOptions)
        .then((response) => response.json())
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e.message);
        });
      // console.log(`Updated row ${row.index} with new comment: ${value}`); //Leaving here for logging and troubleshooting
    }
  };

  return (
    <div>
      <Input
        style={{
          border: "none",
          margin: "0px",
          padding: "0px",
          width: "250px",
          height: "100%",
          resize: "none",
          overflow: "hidden",
        }}
        id={"ta" + row.id}
        type="textarea"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </div>
  );
};

// Turn table IPs into hyperlinks that open a new tab to an iDRAC page on click
const IP_Hyperlink = (props) => {
  let iDRAC_IP = props.cell.row.original.ip;
  let iDRAC_link = "http://" + iDRAC_IP;
  return (
    <div>
      <a target="_blank" href={iDRAC_link} rel="noopener noreferrer">
        {iDRAC_IP}
      </a>
    </div>
  );
};

// Turn server 'Service Tag' into a hyperlink to its inventory text file (temp)
const Server_Inventory = (props) => {
  let server_tag = props.cell.row.original.serviceTag;
  let server = `${props.cell.row.original.ip}.txt`;
  let server_info =
    "http://100.80.149.97/DellReServer/inventory/Latest/" + server;
  return (
    <div>
      <a target="_blank" href={server_info} rel="noopener noreferrer">
        {server_tag}
      </a>
    </div>
  );
};

// Get data for all Search Inventory dropdown lists
function getDropdownData(jsonData, allData) {

  // Create sets to store only unique values for each key
  let setSysBios = new Set();
  let setDriveMakers = new Set();
  let setDriveModels = new Set();
  let setDriveSizes = new Set();
  let setDriveWear = new Set();
  let setDriveSerials = new Set();
  let setProcessorMakes = new Set();
  let setProcessorModels = new Set();
  let setProcessorSpeeds = new Set();
  let setProcessorCores = new Set();
  let setControllerNames = new Set();
  let setControllerFWs = new Set();
  let setControllerPCIslots = new Set();
  let setDimmMakes = new Set();
  let setDimmModels = new Set();
  let setDimmRanks = new Set();
  let setDimmSizes = new Set();
  let setDimmSpeeds = new Set();
  let setNicMakes = new Set();
  let setNicModels = new Set();
  let setNicFWs = new Set();
  let setNicPortNums = new Set();

  const server = jsonData.resultArray.map((item) => item.data);

  // Loop through each server's json data in the array
  server.forEach((server) => {
    // Create a server object to store key-value data to be searched
    let serverObj = {
      ServiceTag: "",
      SystemInfo: {
        BiosVersion: "",
        FirmwareVersion: "",
        CPLD: "",
        DIMMs: [],
        Types: [],
      },
      ProcessorInfo: {
        Manufacturers: [],
        Models: [],
        Speeds: [],
        CoreCounts: [],
      },
      MemoryInfo: {
        Manufacturers: [],
        Models: [],
        Ranks: [],
        Sizes: [],
        Speeds: [],
      },
      StorageDisksInfo: {
        Manufacturers: [],
        Models: [],
        Sizes: [],
        Wear: [],
        FirmwareVersions: [],
        SerialNumbers: [],
      },
      StorageControllersInfo: {
        Names: [],
        FirmwareVersions: [],
        PCISlots: [],
        SASAddresses: [],
        SerialNumbers: [],
      },
      NetworkDevicesInfo: {
        Manufacturers: [],
        Models: [],
        FirmwareVersions: [],
        PortNumbers: [],
      },
    };

    // Create a set for each of server components' searchable data
    let driveMakersSet = new Set();
    let driveModelsSet = new Set();
    let driveSizesSet = new Set();
    let driveWearSet = new Set();
    let driveSerials = new Set();
    // let driveFWsSet = new Set();
    let processorMakersSet = new Set();
    let processorModelsSet = new Set();
    let processorSpeedsSet = new Set();
    let processorCoresSet = new Set();
    let controllerNamesSet = new Set();
    let controllerFWsSet = new Set();
    let controllerPCISlotsSet = new Set();
    // let controllerSASaddressesSet = new Set();
    // let controllerSerialNumsSet = new Set();
    let memoryMakersSet = new Set();
    let memoryModelsSet = new Set();
    let memoryRanksSet = new Set();
    let memorySizesSet = new Set();
    let memorySpeedsSet = new Set();
    // let memoryPartNumsSet = new Set();
    let nicMakersSet = new Set();
    let nicModelsSet = new Set();
    let nicFWsSet = new Set();
    let nicPortNumsSet = new Set();

    // System Information -------------------------------------------------------------------------
    // Add it to set
    setSysBios.add(server.SystemInformation.BiosVersion);

    // Push data into the server object
    serverObj.ServiceTag = server.SystemInformation.SKU;
    serverObj.SystemInfo.BiosVersion = server.SystemInformation.BiosVersion;

    // Storage Disks Information ------------------------------------------------------------------
    // Get the names of the drives
    let sdiKeys = Object.keys(server.StorageDisksInformation);

    // Loop through drives, get then add unique data to array
    sdiKeys.forEach((driveName) => {
      // Add it to set
      if (server.StorageDisksInformation[driveName].Manufacturer) {
        setDriveMakers.add(server.StorageDisksInformation[driveName].Manufacturer);
        // Add it to the drive's set
        driveMakersSet.add(server.StorageDisksInformation[driveName].Manufacturer);
      } else {
        setDriveMakers.add("undefined");
        driveMakersSet.add("undefined");
      }

      // Add it to set
      setDriveModels.add(server.StorageDisksInformation[driveName].Model.trim());
      // Add it to the drive's set
      driveModelsSet.add(server.StorageDisksInformation[driveName].Model);

      // Add it to set
      setDriveSizes.add(server.StorageDisksInformation[driveName].CapacityBytes);
      // Add it to the drive's set
      if (typeof server.StorageDisksInformation[driveName].CapacityBytes === "number")
        driveSizesSet.add(formatSize(server.StorageDisksInformation[driveName].CapacityBytes), false);
      else {
        console.log(server.StorageDisksInformation[driveName].CapacityBytes);
        driveSizesSet.add("invalid");
      }

      // Add it to set
      if (server.StorageDisksInformation[driveName].PredictedMediaLifeLeftPercent !== null) {
        setDriveWear.add(server.StorageDisksInformation[driveName].PredictedMediaLifeLeftPercent); // Add it to the drive's set
        driveWearSet.add(server.StorageDisksInformation[driveName].PredictedMediaLifeLeftPercent);
      } else {
        setDriveWear.add("undefined");
        driveWearSet.add("undefined");
      }

      // Add it to set
      if (server.StorageDisksInformation[driveName].SerialNumber !== null) {
        setDriveSerials.add(server.StorageDisksInformation[driveName].SerialNumber); // Add it to the drive's set
        driveSerials.add(server.StorageDisksInformation[driveName].SerialNumber);
      } else {
        setDriveSerials.add("undefined");
        driveSerials.add("undefined");
      }

      // serverObj.StorageDisksInfo.SerialNumbers.push(server.StorageDisksInformation[driveName].SerialNumber);
    });
    // Push data into the server object
    serverObj.StorageDisksInfo.Manufacturers = [...driveMakersSet];
    serverObj.StorageDisksInfo.Models = [...driveModelsSet];
    serverObj.StorageDisksInfo.Sizes = [...driveSizesSet];
    serverObj.StorageDisksInfo.Wear = [...driveWearSet];
    serverObj.StorageDisksInfo.SerialNumbers = [...driveSerials];
    // add FirmwareVersions here later

    // Processors Information ---------------------------------------------------------------------
    // Get the names of the processors
    let piKeys = Object.keys(server.ProcessorInformation);

    // Loop through processors, get then add unique data to array
    piKeys.forEach((processorName) => {
      // Add it to set
      setProcessorMakes.add(server.ProcessorInformation[processorName].Manufacturer);
      // Add it to the processors' set
      processorMakersSet.add(server.ProcessorInformation[processorName].Manufacturer);

      // Add it to set
      setProcessorModels.add(server.ProcessorInformation[processorName].Model);
      // Add it to the processors' set
      processorModelsSet.add(server.ProcessorInformation[processorName].Model);

      // Add it to set
      setProcessorSpeeds.add(server.ProcessorInformation[processorName].MaxSpeedMHz);
      // Add it to the processors' set
      processorSpeedsSet.add(server.ProcessorInformation[processorName].MaxSpeedMHz);

      // Add it to set
      setProcessorCores.add(server.ProcessorInformation[processorName].TotalCores);
      // Add it to the processors' set
      processorCoresSet.add(server.ProcessorInformation[processorName].TotalCores);
    });
    // Push data into the server object
    serverObj.ProcessorInfo.Manufacturers = [...processorMakersSet];
    serverObj.ProcessorInfo.Models = [...processorModelsSet];
    serverObj.ProcessorInfo.Speeds = [...processorSpeedsSet];
    serverObj.ProcessorInfo.CoreCounts = [...processorCoresSet];

    // Storage Controllers Information ------------------------------------------------------------
    // Get the names of the controllers
    let ciKeys = Object.keys(server.StorageControllerInformation);

    let keySciOemExists = false;
    let keyPciSlotExists = false;
    // Loop through controllers, get then add unique data to array
    ciKeys.forEach((controllerName) => {
      // Add it to set
      setControllerNames.add(server.StorageControllerInformation[controllerName].Name);
      // Add it to the controllers' set
      controllerNamesSet.add(server.StorageControllerInformation[controllerName].Name);

      // 1st check if the key exists then add it to a new key array
      let newSCkeyArr = [];
      if (keyExists(server.StorageControllerInformation[controllerName], "StorageControllers"))
        newSCkeyArr.push(controllerName);
      // else
      //   console.log(`System '${server.SystemInformation.SKU}' controller ${controllerName} does not have the 'StorageControllers' key`);

      // Now, loop through the new key array to find the data seeked
      newSCkeyArr.forEach((cName) => {
        if (server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0] !== "") {
          //   console.log(`System '${server.SystemInformation.SKU}' controller ${cName} does not have the 'Firmware Version' data`);
          // else
          // Add it to set
          setControllerFWs.add(server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0]);
          // Add it to the controllers' set
          controllerFWsSet.add(server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0]);
        }
      });

      // 1st check if the key exists then add it to a new key array
      let newOEMkeyArr = [];

      if (keyExists(server.StorageControllerInformation[controllerName], "Oem")) {
        newOEMkeyArr.push(controllerName);
        keySciOemExists = true;
      } else {
        keySciOemExists = false;
        // console.log(`System '${server.SystemInformation.SKU}' controller ${controllerName} does not have the 'Oem' key`);
      }

      if (keySciOemExists) {
        // Now, loop through the new key array to find the data sought after
        newOEMkeyArr.forEach((cName) => {
          // console.log(`${cName} of ${server.SystemInformation.SKU}`); //debugging
          // Get the keys under 'Dell'
          let oemControllerKeys = Object.keys(server.StorageControllerInformation[cName].Oem.Dell);
          let oemControllerArr = [];
          oemControllerKeys.forEach((oemControllerName) => {
            // Check for existence of PCISlot field
            if (keyExists(server.StorageControllerInformation[cName].Oem.Dell[oemControllerName], "PCISlot")) {
              oemControllerArr.push(oemControllerName);
              keyPciSlotExists = true;
            } else {
              // console.log(`${oemControllerName} of ${server.SystemInformation.SKU} does not have PCISlot field`);
              keyPciSlotExists = false;
            }
          });
          if (keyPciSlotExists) {
            oemControllerArr.forEach((oemControllerName) => {
              if (server.StorageControllerInformation[cName].Oem.Dell[oemControllerName].PCISlot !== null) {
                //   console.log(`System '${server.SystemInformation.SKU}' controller ${controllerName} does not have 'PCISlot' data`);
                // } else {
                // Add it to set
                setControllerPCIslots.add(server.StorageControllerInformation[cName].Oem.Dell[oemControllerName].PCISlot);
                // Add it to the controllers' set
                controllerPCISlotsSet.add(server.StorageControllerInformation[cName].Oem.Dell[oemControllerName].PCISlot);
              }
            });
          }
        });
      }
    });
    // Push data into the server object
    serverObj.StorageControllersInfo.Names = [...controllerNamesSet];
    serverObj.StorageControllersInfo.FirmwareVersions = [...controllerFWsSet];
    if (keyPciSlotExists)
      serverObj.StorageControllersInfo.PCISlots = [...controllerPCISlotsSet];
    else serverObj.StorageControllersInfo.PCISlots = [];

    // Memory Information -------------------------------------------------------------------------
    // Get the names of the DIMMs
    let miKeys = Object.keys(server.MemoryInformation);

    // Loop through keys and store unique data
    miKeys.forEach((dimmSocket) => {
      // Add it to set
      setDimmMakes.add(server.MemoryInformation[dimmSocket].Manufacturer);
      // Add it to the memory set
      memoryMakersSet.add(server.MemoryInformation[dimmSocket].Manufacturer);
      // Add it to set
      setDimmModels.add(server.MemoryInformation[dimmSocket].MemoryDeviceType);
      // Add it to the memory set
      memoryModelsSet.add(server.MemoryInformation[dimmSocket].MemoryDeviceType);
      // Add it to set
      setDimmRanks.add(server.MemoryInformation[dimmSocket].RankCount);
      // Add it to the memory set
      memoryRanksSet.add(server.MemoryInformation[dimmSocket].RankCount);
      // Add it to set
      setDimmSizes.add(server.MemoryInformation[dimmSocket].CapacityMiB * 1000);
      // Add it to the memory set
      memorySizesSet.add(formatSize(server.MemoryInformation[dimmSocket].CapacityMiB * 1000, true));
      // Add it to set
      setDimmSpeeds.add(server.MemoryInformation[dimmSocket].OperatingSpeedMhz);
      // Add it to the memory set
      memorySpeedsSet.add(server.MemoryInformation[dimmSocket].OperatingSpeedMhz);
    });
    // Push data into the server object
    serverObj.MemoryInfo.Manufacturers = [...memoryMakersSet];
    serverObj.MemoryInfo.Models = [...memoryModelsSet];
    serverObj.MemoryInfo.Ranks = [...memoryRanksSet];
    serverObj.MemoryInfo.Sizes = [...memorySizesSet];
    serverObj.MemoryInfo.Speeds = [...memorySpeedsSet];

    // Network Device Information -----------------------------------------------------------------
    // Add it to set
    if (server.NetworkDeviceInformation.Manufacturer) {
      setNicMakes.add(server.NetworkDeviceInformation.Manufacturer); // Add it to NICs set
      nicMakersSet.add(server.NetworkDeviceInformation.Manufacturer);
    } else {
      setNicMakes.add("undefined");
      nicMakersSet.add("undefined");
    }

    // Add it to set
    if (server.NetworkDeviceInformation.Model) {
      setNicModels.add(server.NetworkDeviceInformation.Model); // Add it to NICs set
      nicModelsSet.add(server.NetworkDeviceInformation.Model);
    } else {
      setNicModels.add("undefined");
      nicModelsSet.add("undefined");
    }

    // Add it to set
    if (server.NetworkDeviceInformation.FirmwarePackageVersion) {
      setNicFWs.add(server.NetworkDeviceInformation.FirmwarePackageVersion); // Add it to NICs set
      nicFWsSet.add(server.NetworkDeviceInformation.FirmwarePackageVersion);
    } else {
      setNicFWs.add("undefined");
      nicFWsSet.add("undefined");
    }

    let ndiKeys = Object.keys(server.NetworkDeviceInformation);

    ndiKeys.forEach((ndiKey) => {
      if (ndiKey.includes("NIC")) {
        let nicKeys = Object.keys(server.NetworkDeviceInformation[ndiKey]);

        nicKeys.forEach((nicKey) => {
          // Add it to set
          setNicPortNums.add(server.NetworkDeviceInformation[ndiKey][nicKey].PhysicalPortNumber);
          // Add it to NICs set
          nicPortNumsSet.add(server.NetworkDeviceInformation[ndiKey][nicKey].PhysicalPortNumber);
        });
      }
    });
    // Push data into the server object
    serverObj.NetworkDevicesInfo.Manufacturers = [...nicMakersSet];
    serverObj.NetworkDevicesInfo.Models = [...nicModelsSet];
    serverObj.NetworkDevicesInfo.FirmwareVersions = [...nicFWsSet];
    serverObj.NetworkDevicesInfo.PortNumbers = [...nicPortNumsSet];

    // Add server object's data to the main array
    allServerObj.push(serverObj);
    console.log(allServerObj)
  });

  // Convert sets to arrays, then sort the items
  let sortedSysBios = (sortDropdownItems(Array.from(setSysBios), "version"))
  let sortedDriveMakes = sortDropdownItems(Array.from(setDriveMakers), "string");
  let sortedDriveModels = sortDropdownItems(Array.from(setDriveModels), "string");
  let sortedDriveSizes = sortDropdownItems(Array.from(setDriveSizes), "integer");
  let sortedDriveWear = sortDropdownItems(Array.from(setDriveWear), "integer");
  let sortedDriveSerials = sortDropdownItems(Array.from(setDriveSerials), "integer");
  let sortedProcessorMakes = sortDropdownItems(Array.from(setProcessorMakes), "string");
  let sortedProcessorModels = sortDropdownItems(Array.from(setProcessorModels), "string");
  let sortedProcessorSpeeds = sortDropdownItems(Array.from(setProcessorSpeeds), "integer");
  let sortedProcessorCores = sortDropdownItems(Array.from(setProcessorCores), "integer");
  let sortedControllerNames = sortDropdownItems(Array.from(setControllerNames), "string");
  let sortedControllerFWs = sortDropdownItems(Array.from(setControllerFWs), "version");
  let sortedControllerPCIslots = sortDropdownItems(Array.from(setControllerPCIslots), "integer");
  let sortedDimmMakes = sortDropdownItems(Array.from(setDimmMakes), "string");
  let sortedDimmModels = sortDropdownItems(Array.from(setDimmModels), "string");
  let sortedDimmRanks = sortDropdownItems(Array.from(setDimmRanks), "integer");
  let sortedDimmSizes = sortDropdownItems(Array.from(setDimmSizes), "integer");
  let sortedDimmSpeeds = sortDropdownItems(Array.from(setDimmSpeeds), "integer");
  let sortedNicMakes = sortDropdownItems(Array.from(setNicMakes), "string");
  let sortedNicModels = sortDropdownItems(Array.from(setNicModels), "string");
  let sortedNicFWs = sortDropdownItems(Array.from(setNicFWs), "version");
  let sortedNicPortNums = sortDropdownItems(Array.from(setNicPortNums), "integer");

  // // Reformat size values into human-readable format
  // sortedDriveSizes.forEach(item => formatSize(item));
  // sortedDimmSizes.forEach(item => formatSize(item));

  // Create an array of sorted arrays
  let sortedArrays = [
    sortedSysBios,
    sortedDriveMakes,
    sortedDriveModels,
    sortedDriveSizes,
    sortedDriveWear,
    sortedDriveSerials,
    sortedProcessorMakes,
    sortedProcessorModels,
    sortedProcessorSpeeds,
    sortedProcessorCores,
    sortedDimmMakes,
    sortedDimmModels,
    sortedDimmRanks,
    sortedDimmSizes,
    sortedDimmSpeeds,
    sortedControllerNames,
    sortedControllerFWs,
    sortedControllerPCIslots,
    sortedNicPortNums,
    sortedNicMakes,
    sortedNicModels,
    sortedNicFWs,
    sortedNicPortNums,
  ];

  // Loop through sorted arrays and set them up for dropdowns
  sortedArrays.forEach((sorted) => {
    console.log("Setting up dropdowns w/label & value..");
    if (sorted) {
      // Skip if an array is already setup for a dropdown
      if (typeof sorted[0] !== "object") {
        if (sorted === sortedDriveSizes || sorted === sortedDimmSizes) {
          // Set a map to collect only unique values and push/remove array items to reflect the map
          let tempMap = new Map();
          sorted.forEach((item) => {
            if (typeof item == "number") {
              // console.log("Valid: " + item); //debugging
              if (sorted === sortedDriveSizes)
                item = formatSize(item, false);
              else
                item = formatSize(item, true);
            } else {
              // console.log("Invalid: " + item); //debugging
              item = "invalid";
            };
            if (!tempMap.has(item)) {
              tempMap.set(item, true);
              sorted.push({ label: item, value: item });
            } else {
              sorted.splice(item.index, 1);
            };
          });
          sorted.splice(0, sorted.length / 2);
        } else {
          sorted.forEach((item) => {
            sorted.push({ label: item, value: item });
          });
          sorted.splice(0, sorted.length / 2);
        };
      };
    };
  });

  // Store data in the top-level object
  allData["SystemInfo"]["Bios"] = sortedSysBios;
  allData["StorageDisksInfo"]["Manufacturers"] = sortedDriveMakes;
  allData["StorageDisksInfo"]["Models"] = sortedDriveModels;
  allData["StorageDisksInfo"]["Sizes"] = sortedDriveSizes;
  allData["StorageDisksInfo"]["Wear"] = sortedDriveWear;
  allData["StorageDisksInfo"]["SerialNumber"] = sortedDriveSerials;
  allData["ProcessorInfo"]["Manufacturers"] = sortedProcessorMakes;
  allData["ProcessorInfo"]["Models"] = sortedProcessorModels;
  allData["ProcessorInfo"]["Speeds"] = sortedProcessorSpeeds;
  allData["ProcessorInfo"]["Cores"] = sortedProcessorCores;
  allData["StorageControllersInfo"]["Names"] = sortedControllerNames;
  allData["StorageControllersInfo"]["FWs"] = sortedControllerFWs;
  allData["StorageControllersInfo"]["PCISlots"] = sortedControllerPCIslots;
  allData["MemoryInfo"]["Manufacturers"] = sortedDimmMakes;
  allData["MemoryInfo"]["Models"] = sortedDimmModels;
  allData["MemoryInfo"]["Ranks"] = sortedDimmRanks;
  allData["MemoryInfo"]["Sizes"] = sortedDimmSizes;
  allData["MemoryInfo"]["Speeds"] = sortedDimmSpeeds;
  allData["NetworkDevicesInfo"]["Manufacturers"] = sortedNicMakes;
  allData["NetworkDevicesInfo"]["Models"] = sortedNicModels;
  allData["NetworkDevicesInfo"]["FWs"] = sortedNicFWs;
  allData["NetworkDevicesInfo"]["PortNumbers"] = sortedNicPortNums;

  return allData;
}

// Function that looks for all key-values to match
function matchAll(serverObj, searchVals) {
  try {
    let result;

    // Get key-value pairs of search criteria
    let svKVs = Object.entries(searchVals[0]);

    // Initialize match and criteria counters
    let matchCounter = 0;
    let criteriaCounter = 0;

    // Loop through search criteria key-value pairs and check them
    // against each server's object data; count the matches.
    svKVs.forEach((kv) => {
      if (kv[1].length > 0) {
        criteriaCounter++;
        switch (kv[0]) {
          case "BiosOptions":
            if (kv[1].includes(serverObj.SystemInfo.BiosVersion))
              matchCounter++;
            break;
          case "DriveMakers":
            if (serverObj.StorageDisksInfo.Manufacturers.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "DriveModels":
            if (serverObj.StorageDisksInfo.Models.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "DriveSizes":
            if (serverObj.StorageDisksInfo.Sizes.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "DriveWear":
            if (serverObj.StorageDisksInfo.Wear.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "DriveSerials":
            if (serverObj.StorageDisksInfo.SerialNumbers.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "ProcessorMakes":
            if (serverObj.ProcessorInfo.Manufacturers.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "ProcessorModels":
            if (serverObj.ProcessorInfo.Models.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "ProcessorSpeeds":
            if (serverObj.ProcessorInfo.Speeds.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "ProcessorCores":
            if (serverObj.ProcessorInfo.CoreCounts.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "ControllerNames":
            if (serverObj.StorageControllersInfo.Names.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "ControllerFWs":
            if (serverObj.StorageControllersInfo.FirmwareVersions.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "ControllerPCIslots":
            if (serverObj.StorageControllersInfo.PCISlots.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "MemoryMakers":
            if (serverObj.MemoryInfo.Manufacturers.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "MemoryModels":
            if (serverObj.MemoryInfo.Models.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "MemoryRanks":
            if (serverObj.MemoryInfo.Ranks.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "MemorySizes":
            if (serverObj.MemoryInfo.Sizes.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "MemorySpeeds":
            if (serverObj.MemoryInfo.Speeds.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "NicMakers":
            if (serverObj.NetworkDevicesInfo.Manufacturers.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "NicModels":
            if (serverObj.NetworkDevicesInfo.Models.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "NicFWs":
            if (serverObj.NetworkDevicesInfo.FirmwareVersions.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          case "NicPorts":
            if (serverObj.NetworkDevicesInfo.PortNumbers.some((s) => kv[1].includes(s)))
              matchCounter++;
            break;
          default:
            console.log("Some error in matchAll function's loop..");
            break;
        }
      }
    });

    // Return boolean based on count of matches vs count of criteria
    matchCounter == criteriaCounter ? (result = true) : (result = false);
    return result;
  } catch (e) {
    console.log("Error in matchAll function:");
    console.log(e);
  }
}

// Function that returns an array of Service Tags of those servers that match
// the search criteria
function searchServers(criteria, jsonData) {
  let match;
  let matchingServersSet = new Set();
  let matchingServers = [];
  let result = { found: 0, servers: matchingServers };

  // Loop through each server's json data in the array
  jsonData.forEach((server) => {
    // Call function to check ALL criteria against node's data
    match = matchAll(server, criteria);
    if (match) {
      // Include a match only once
      matchingServersSet.add(server.ServiceTag);
    }
  });
  // Convert set to array
  matchingServers = Array.from(matchingServersSet);
  // Shove results into the return object
  result.found = matchingServers.length;
  result.servers = matchingServers;

  return result;
}

// Function to save object's values to an array
function saveToArr(data) {
  let dataInArray = [];
  if (data) {
    data.forEach((obj) => {
      dataInArray.push(obj.value);
    });
  }
  return dataInArray;
}

// Fetch server data from db and add it to state
function fetchServers(tagArr) {
  return new Promise((resolve, reject) => {
    console.log(`'fetchServers' from db function called.`); //debugging

    // Fetch these Service Tags to a db query
    // Specify request options
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ ServiceTagArr: tagArr }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    fetch(`${apiServer}/getServersByTag`, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        console.log(`Catch in fetchServers on fetch: ${e.statusText}`);
        reject([]);
      });
  });
}

// Function to sort an array of different type of values in ascending order
function sortDropdownItems(arrToSort, itemType) {
  let resultArr = arrToSort;
  if (arrToSort) {
    if (itemType === "string") resultArr = arrToSort.sort();
    else if (itemType === "integer")
      resultArr = arrToSort.sort(function (a, b) {
        return a - b;
      });
    else if (itemType === "version") {
      resultArr.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    };
  };
  return resultArr;
}

// Search Card with all dropdowns -----------------------------------------------------------------
function SearchCard() {
  // Store dropdowns' selections via state hooks
  const [biosOptions, setSelectedBiosOptions] = useState([]);
  const [driveMakers, setSelectedDriveMakers] = useState([]);
  const [driveModels, setSelectedDriveModels] = useState([]);
  const [driveSizes, setSelectedDriveSizes] = useState([]);
  const [driveWear, setSelectedDriveWear] = useState([]);
  const [driveSerials, setDriveSerials] = useState([]);
  const [processorMakes, setSelectedProcessorMakes] = useState([]);
  const [processorModels, setSelectedProcessorModels] = useState([]);
  const [processorSpeeds, setSelectedProcessorSpeeds] = useState([]);
  const [processorCores, setSelectedProcessorCores] = useState([]);
  const [controllerNames, setSelectedControllerNames] = useState([]);
  const [controllerFWs, setSelectedControllerFWs] = useState([]);
  const [controllerPCIslots, setSelectedControllerPCIslots] = useState([]);
  const [memoryMakers, setSelectedMemoryMakers] = useState([]);
  const [memoryModels, setSelectedMemoryModels] = useState([]);
  const [memoryRanks, setSelectedMemoryRanks] = useState([]);
  const [memorySizes, setSelectedMemorySizes] = useState([]);
  const [memorySpeeds, setSelectedMemorySpeeds] = useState([]);
  const [nicMakers, setSelectedNicMakers] = useState([]);
  const [nicModels, setSelectedNicModels] = useState([]);
  const [nicFWs, setSelectedNicFWs] = useState([]);
  const [nicPorts, setSelectedNicPorts] = useState([]);
  const [dropdownDataFromAPI, setDropdownDataFromAPI] = useRecoilState(
    allDropDownData
  );
  // Store results of search via state hook
  const [search, setSearch] = useRecoilState(searchState);

  // Upon initial load get the dropdown data
  useEffect(() => {
    // Get the data from database JSON
    axios
      .get(`${apiServer}/getHardwareInventory`)
      .then((response) => {
        setDropdownDataFromAPI(
          getDropdownData(response.data, dropdownDataFromAPI)
        );
        // console.log(response.data);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, []);

  // Upon any selection from a dropdown run a search
  useEffect(() => {
    // console.log(`useEffect on dropdown change`);

    // Store chosen dropdown values to run a search
    let searchValues = [
      {
        BiosOptions: saveToArr(biosOptions),
        DriveMakers: saveToArr(driveMakers),
        DriveModels: saveToArr(driveModels),
        DriveSizes: saveToArr(driveSizes),
        DriveWear: saveToArr(driveWear),
        DriveSerials: saveToArr(driveSerials),
        ProcessorMakes: saveToArr(processorMakes),
        ProcessorModels: saveToArr(processorModels),
        ProcessorSpeeds: saveToArr(processorSpeeds),
        ProcessorCores: saveToArr(processorCores),
        ControllerNames: saveToArr(controllerNames),
        ControllerFWs: saveToArr(controllerFWs),
        ControllerPCIslots: saveToArr(controllerPCIslots),
        MemoryMakers: saveToArr(memoryMakers),
        MemoryModels: saveToArr(memoryModels),
        MemoryRanks: saveToArr(memoryRanks),
        MemorySizes: saveToArr(memorySizes),
        MemorySpeeds: saveToArr(memorySpeeds),
        NicMakers: saveToArr(nicMakers),
        NicModels: saveToArr(nicModels),
        NicFWs: saveToArr(nicFWs),
        NicPorts: saveToArr(nicPorts),
      },
    ];

    // Get all key-value pairs from the dropdowns
    let svKVs = Object.entries(searchValues[0]);

    searchEmpty = true;
    svKVs.forEach((kv) => {
      if (kv[1].length > 0) {
        // Set flag
        searchEmpty = false;
        // console.log(kv);
      }
    });
    if (!searchEmpty) {
      let searchRes = searchServers(searchValues, allServerObj);
      if (searchRes.found > 0) {
        console.log(
          `Search found ${searchRes.found} machine(s) matching your criteria: ${searchRes.servers}`
        );
        // Update the component state
        setSearch(searchRes.servers);
      } else {
        setSearch([]);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log("Search did not find matches with the selected criteria.");
      setSearch([]);
    }
  }, [
    biosOptions,
    driveMakers,
    driveModels,
    driveSizes,
    driveWear,
    driveSerials,
    processorMakes,
    processorModels,
    processorSpeeds,
    processorCores,
    controllerNames,
    controllerFWs,
    controllerPCIslots,
    memoryMakers,
    memoryModels,
    memoryRanks,
    memorySizes,
    memorySpeeds,
    nicMakers,
    nicModels,
    nicFWs,
    nicPorts,
  ]);

  return (
    <>
      <Header />
      {/* Page content */}
      <div className="header bg-gradient-info">
        <Container className="mt--9" fluid={true}>
          {/* style={{border: "none", margin: "1px", padding: "25px", width: "auto", height: "100%", resize: "none" }} */}
          <div className="col">
            <row>
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Search Components</h3>
                  <Form>
                    <br></br>
                    <Row>
                      <Col sm={1}>
                        {/* <br></br> */}
                        <Label>System Information</Label>
                      </Col>
                      <Col xs={1}></Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select BIOS.."
                            options={dropdownDataFromAPI.SystemInfo.Bios}
                            isMulti
                            isSearchable
                            onChange={setSelectedBiosOptions}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="iDRAC FW"
                          // options={}
                          // isMulti
                          // isSearchable
                          // onChange={setSelectedSysFWs}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="CPLD"
                          // options={}
                          // isMulti
                          // isSearchable
                          // onChange={setSelectedSysCPLDs}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="DIMM Count"
                          // options={}
                          // isMulti
                          // isSearchable
                          // onChange={setSelectedSysDIMMs}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Total Mem"
                          // options={}
                          // isMulti
                          // isSearchable
                          // onChange={setSelectedSysMemTypes}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={1}>
                        {/* <br></br> */}
                        <Label>Drive Information</Label>
                      </Col>
                      <Col xs={1}></Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Make"
                            options={
                              dropdownDataFromAPI.StorageDisksInfo.Manufacturers
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedDriveMakers}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Model"
                            options={
                              dropdownDataFromAPI.StorageDisksInfo.Models
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedDriveModels}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Size"
                            options={dropdownDataFromAPI.StorageDisksInfo.Sizes}
                            isMulti
                            isSearchable
                            onChange={setSelectedDriveSizes}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Life %"
                            options={dropdownDataFromAPI.StorageDisksInfo.Wear}
                            isMulti
                            isSearchable
                            onChange={setSelectedDriveWear}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Firmware"
                          // options={}
                          // isMulti
                          // isSearchable
                          // onChange={setSelectedDriveFWs}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Serial #"
                            options={dropdownDataFromAPI.StorageDisksInfo.SerialNumber}
                            isMulti
                            isSearchable
                            onChange={setDriveSerials}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={1}>
                        {/* <br></br> */}
                        <Label>Processor Information</Label>
                      </Col>
                      <Col xs={1}></Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Make"
                            options={
                              dropdownDataFromAPI.ProcessorInfo.Manufacturers
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedProcessorMakes}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Model"
                            options={dropdownDataFromAPI.ProcessorInfo.Models}
                            isMulti
                            isSearchable
                            onChange={setSelectedProcessorModels}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Speed"
                            options={dropdownDataFromAPI.ProcessorInfo.Speeds}
                            isMulti
                            isSearchable
                            onChange={setSelectedProcessorSpeeds}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Core Count"
                            options={dropdownDataFromAPI.ProcessorInfo.Cores}
                            isMulti
                            isSearchable
                            onChange={setSelectedProcessorCores}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Core Count</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="CPU Count"
                            // options={dropdownDataFromAPI.ProcessorInfo.Cores}
                            isMulti
                            isSearchable
                          // onChange={setSelectedProcessorCores}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={1}>
                        {/* <br></br> */}
                        <Label>Controllers Information</Label>
                      </Col>
                      <Col xs={1}></Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Name"
                            options={
                              dropdownDataFromAPI.StorageControllersInfo.Names
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedControllerNames}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Firmware"
                            options={
                              dropdownDataFromAPI.StorageControllersInfo.FWs
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedControllerFWs}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="PCI slot"
                            options={
                              dropdownDataFromAPI.StorageControllersInfo
                                .PCISlots
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedControllerPCIslots}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">SAS Address</Label> */}
                          {/* <Input
                            type="text"
                            name="search"
                            id="exampleText"
                            placeholder="Enter SAS address"
                          /> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="SAS Address"
                            // options={dropdownDataFromAPI.StorageControllersInfo.PCISlots}
                            isMulti
                            isSearchable
                          // onChange={setSelectedControllerPCIslots}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Serial Number</Label> */}
                          {/* <Input
                            type="text"
                            name="search"
                            id="exampleText"
                            placeholder="Enter serial #"
                          /> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Serial #"
                            // options={dropdownDataFromAPI.StorageControllersInfo.PCISlots}
                            isMulti
                            isSearchable
                          // onChange={setSelectedControllerPCIslots}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={1}>
                        {/* <br></br> */}
                        <Label>DIMMs Information</Label>
                      </Col>
                      <Col xs={1}></Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Make"
                            options={
                              dropdownDataFromAPI.MemoryInfo.Manufacturers
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedMemoryMakers}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Model"
                            options={dropdownDataFromAPI.MemoryInfo.Models}
                            isMulti
                            isSearchable
                            onChange={setSelectedMemoryModels}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Rank"
                            options={dropdownDataFromAPI.MemoryInfo.Ranks}
                            isMulti
                            isSearchable
                            onChange={setSelectedMemoryRanks}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Size"
                            options={dropdownDataFromAPI.MemoryInfo.Sizes}
                            isMulti
                            isSearchable
                            onChange={setSelectedMemorySizes}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Speed"
                            options={dropdownDataFromAPI.MemoryInfo.Speeds}
                            isMulti
                            isSearchable
                            onChange={setSelectedMemorySpeeds}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Part Number</Label> */}
                          {/* <Input
                            type="text"
                            name="search"
                            id="exampleText"
                            placeholder="Enter part #"
                          /> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Part #"
                            // options={dropdownDataFromAPI.MemoryInfo.Speeds}
                            isMulti
                            isSearchable
                          // onChange={setSelectedMemorySpeeds}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={1}>
                        {/* <br></br> */}
                        <Label>NICs Information</Label>
                      </Col>
                      <Col xs={1}></Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Make"
                            options={
                              dropdownDataFromAPI.NetworkDevicesInfo
                                .Manufacturers
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedNicMakers}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Model"
                            options={
                              dropdownDataFromAPI.NetworkDevicesInfo.Models
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedNicModels}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Firmware"
                            options={dropdownDataFromAPI.NetworkDevicesInfo.FWs}
                            isMulti
                            isSearchable
                            onChange={setSelectedNicFWs}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Port"
                            options={
                              dropdownDataFromAPI.NetworkDevicesInfo.PortNumbers
                            }
                            isMulti
                            isSearchable
                            onChange={setSelectedNicPorts}
                          />
                          {/* <Input type="text" name="search" id="exampleText" placeholder="Enter port #" /> */}
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Port Number</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="MAC Address"
                            // options={dropdownDataFromAPI.NetworkDevicesInfo.PortNumbers}
                            isMulti
                            isSearchable
                          // onChange={setSelectedNicPorts}
                          />
                          {/* <Input type="text" name="search" id="exampleText" placeholder="Enter port #" /> */}
                        </FormGroup>
                      </Col>
                    </Row>
                    {/* <Row>
                      <Col sm={5}>
                        <FormGroup>
                          <Input
                            type="text-area"
                            name="machines"
                            id="exampleText"
                            placeholder="search results"
                            value={searchData}
                          />
                        </FormGroup>
                      </Col>
                    </Row> */}
                  </Form>
                </CardHeader>
              </Card>
            </row>
          </div>
        </Container>
        {/* Table */}
      </div>
      {/* Page content */}
    </>
  );
}

// Tables Card with the server table --------------------------------------------------------------
function Tables({ columns, data, updateMyData, loading, skipPageResetRef }) {
  //default options defined for the lottie file loading animation
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: dotLoading.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  //Fuzzy text filtering
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // rows,
    prepareRow,
    pageOptions,
    page,
    state,
    pageCount,
    gotoPage,
    previousPage,
    nextPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      autoResetPage: !skipPageResetRef.current,
      autoResetExpanded: !skipPageResetRef.current,
      autoResetGroupBy: !skipPageResetRef.current,
      autoResetSelectedRows: !skipPageResetRef.current,
      autoResetSortBy: !skipPageResetRef.current,
      autoResetFilters: !skipPageResetRef.current,
      autoResetRowState: !skipPageResetRef.current,
      updateMyData,
      defaultColumn,
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useAsyncDebounce
  );

  return (
    <>
      <Header />
      <div className="header pb-1 pt-1 pt-sm-1">
        <Container className="mt--9" fluid={true}>
          {/* Table */}
          <Row>
            <div className="col">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Search Results</h3>
                </CardHeader>
                {!loading.done ? (
                  <FadeIn>
                    <Row className="d-flex justify-content-center align-items-center ">
                      <div>
                        <h1>Loading Data</h1>
                        <Lottie
                          options={defaultOptions}
                          height={120}
                          width={120}
                        />
                      </div>
                    </Row>
                  </FadeIn>
                ) : (
                    <React.Fragment>
                      <Table
                        className="align-items-center"
                        bordered
                        hover
                        responsive
                        size="sm"
                        {...getTableProps()}
                      >
                        <thead>
                          {headerGroups.map((headerGroup) => (
                            <tr
                              key={headerGroup.id}
                              {...headerGroup.getHeaderGroupProps()}
                            >
                              {headerGroup.headers.map((column) => (
                                <th key={column.id} {...column.getHeaderProps()}>
                                  <div>
                                    <span {...column.getSortByToggleProps()}>
                                      {column.render("Header")}
                                      {/* Add a sort direction indicator */}
                                      {column.isSorted
                                        ? column.isSortedDesc
                                          ? " 🔽"
                                          : " 🔼"
                                        : ""}
                                    </span>
                                  </div>
                                  <br />
                                  {/* Render the columns filter UI */}
                                  <div>
                                    {column.canFilter
                                      ? column.render("Filter")
                                      : null}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          ))}
                          <tr>
                            <th
                              colSpan={visibleColumns.length}
                              style={{
                                textAlign: "left",
                              }}
                            >
                              <GlobalFilter
                                preGlobalFilteredRows={preGlobalFilteredRows}
                                globalFilter={state.globalFilter}
                                setGlobalFilter={setGlobalFilter}
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody {...getTableBodyProps()}>
                          {page.map((row) => {
                            prepareRow(row);
                            return (
                              <tr key={row.id} id={row.id} {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                  return (
                                    <td
                                      key={cell.id}
                                      id={cell.id}
                                      {...cell.getCellProps()}
                                    >
                                      {cell.render("Cell")}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                      <CardFooter className="py-4">
                        <nav aria-label="...">
                          <Pagination
                            className="pagination justify-content-end mb-0"
                            listClassName="justify-content-end mb-0"
                          >
                            <Button color="info">
                              Page {pageIndex + 1} of {pageOptions.length}
                              <span className="sr-only">unread messages</span>
                            </Button>
                            <Button
                              className="btn-icon btn-2"
                              color="primary"
                              type="button"
                              onClick={() => gotoPage(0)}
                              disabled={!canPreviousPage}
                            >
                              <span className="btn-inner--icon">
                                <i className="fas fa-angle-double-left"></i>
                              </span>
                            </Button>{" "}
                            {/* Previous Page */}
                            <Button
                              className="btn-icon btn-2"
                              color="primary"
                              type="button"
                              onClick={() => previousPage()}
                              disabled={!canPreviousPage}
                            >
                              <span className="btn-inner--icon">
                                <i className="fas fa-angle-left"></i>
                              </span>
                            </Button>{" "}
                            {/* Next Page */}
                            <Button
                              className="btn-icon btn-2"
                              color="primary"
                              type="button"
                              onClick={() => nextPage()}
                              disabled={!canNextPage}
                            >
                              <span className="btn-inner--icon">
                                <i className="fas fa-angle-right"></i>
                              </span>
                            </Button>{" "}
                            <Button
                              className="btn-icon btn-2"
                              color="primary"
                              type="button"
                              onClick={() => gotoPage(pageCount - 1)}
                              disabled={!canNextPage}
                            >
                              <span className="btn-inner--icon">
                                <i className="fas fa-angle-double-right"></i>
                              </span>
                            </Button>{" "}
                            {/* <button
                          onClick={() => gotoPage(pageCount - 1)}
                          disabled={!canNextPage}
                        >
                          {">>"}
                        </button>{" "} */}
                            {/* <span>
                          Page{" "}
                          <strong>
                            {pageIndex + 1} of {pageOptions.length}
                          </strong>{" "}
                        </span> */}
                            {/* <span>
                          | Go to page:{" "}
                          <input
                            type="number"
                            defaultValue={pageIndex + 1}
                            onChange={e => {
                              const page = e.target.value
                                ? Number(e.target.value) - 1
                                : 0;
                              gotoPage(page);
                            }}
                            style={{ width: "100px" }}
                          />
                        </span>{" "} */}
                            <Form.Control
                              as="select"
                              custom
                              value={pageSize}
                              onChange={(e) => {
                                setPageSize(Number(e.target.value));
                              }}
                              onBlur={(e) => {
                                setPageSize(Number(e.target.value));
                              }}
                            >
                              {[10, 20, 30, 40, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                  Show {pageSize}
                                </option>
                              ))}
                            </Form.Control>
                          </Pagination>
                        </nav>
                      </CardFooter>
                    </React.Fragment>
                  )}
              </Card>
            </div>
          </Row>
        </Container>
      </div>
    </>
  );
}

function SearchInventory() {
  const userInfo = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState({ done: undefined });
  const [searchArr, setSearchArr] = useRecoilState(searchState);

  let searchArrLength = searchArr.length;

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.

  const skipPageResetRef = React.useRef();

  const columns = React.useMemo(
    () => [
      {
        Header: "Action",
        // eslint-disable-next-line
        Cell: (props) => {
          // Pull data for each row and save it into temp variables
          let dbRowIdx = props.cell.row.original._id;
          let tblRowIdx = props.row.index;
          let rowStatus = props.cell.row.original.status;
          let rowTag = props.cell.row.original.serviceTag;
          let btnId = "btn" + tblRowIdx;
          let btnVal = "";
          let btnBkgdColor = "white";
          let ColorCheckOut = "lightgreen";
          let ColorCheckIn = "#fb6340";
          let ColorTaken = "lightgray";

          // console.log("dbRowIdx: ", dbRowIdx, " and tblRowIdx: ", tblRowIdx); // debugging

          // Set action button props based on db's 'Status' value for each row
          if (rowStatus === "available") {
            btnVal = "Check-Out";
            btnBkgdColor = ColorCheckOut;
          } else if (rowStatus === userInfo.name) {
            btnVal = "Check-In";
            btnBkgdColor = ColorCheckIn;
          } else if (rowStatus !== userInfo.name) {
            btnVal = "taken";
            btnBkgdColor = ColorTaken;
          }

          // Build the action button for each row with the props set above
          return (
            <Button
              size="sm"
              style={{
                minWidth: 80, // set button's width so they are uniform in size
                // minHeight: 30,
                backgroundColor: btnBkgdColor,
              }}
              id={btnId}
              value={btnVal}
              disabled={
                rowStatus === "available" || rowStatus === userInfo.name
                  ? false
                  : true
              }
              onClick={() => {
                // Get current timestamp
                let currentDateAndTime = new Date().toLocaleString();

                // Declare var 'payload' for PATCH req to db
                let payload;

                // Declare var 'checkStatus' for status req to db
                let checkStatus = "";

                // console.log("onClick btnVal: ", btnVal); //debugging

                // Set action logic based on button's Action value
                if (btnVal === "Check-Out") {
                  // Run db check to see if this server is still available
                  fetch(`${apiServer}/status/${dbRowIdx}`)
                    .then((res) => res.json())
                    .then(({ status }) => {
                      checkStatus = status;

                      // console.log("Check status: ", checkStatus); //debugging

                      // Based on the db check above either check-out the server into user's name or
                      // notify the user that it has already been checked-out
                      if (checkStatus === "available") {
                        // Set the payload with user's name and current timestamp
                        payload = {
                          status: userInfo.name,
                          timestamp: currentDateAndTime,
                        };
                        // Specify req options based on the current availability status
                        const requestOptions = {
                          method: "PATCH",
                          body: JSON.stringify(payload),
                          headers: { "Content-Type": "application/json" },
                        };

                        // console.log(
                        //   "Checking-out ",
                        //   serviceTag,
                        //   " out of db with these values: ",
                        //   payload.status,
                        //   " and ",
                        //   payload.timestamp,
                        //   " for dbRowIdx ",
                        //   dbRowIdx,
                        //   " and tblRowIdx ",
                        //   tblRowIdx
                        // ); //debugging

                        // Fetch it to the backend API with a new status
                        fetch(
                          `${apiServer}/patchStatus/${dbRowIdx}`,
                          requestOptions
                        ).then((response) => response.json());
                        // .then(response => console.log(response));

                        // Update row's 'Status' to the currently logged-in username
                        updateMyData(tblRowIdx, "status", payload.status);

                        // Update the row's 'Timestamp' to the current time
                        updateMyData(
                          tblRowIdx,
                          "timestamp",
                          currentDateAndTime
                        );
                      } else {
                        // Here, let the user know that this server has already been taken
                        // console.log(
                        //   "Sorry, the server ",
                        //   rowTag,
                        //   " has already been checked-out by: ",
                        //   checkStatus
                        // ); //debugging
                        alert(
                          `Sorry, the server ${rowTag} has already been checked-out by: ${checkStatus}. Please, refresh the page to see the updates.`
                        );
                        return;
                      }
                    });
                } else {
                  // Set the payload with 'available' status and current timestamp
                  payload = {
                    status: "available",
                    timestamp: currentDateAndTime,
                  };
                  // Specify req options based on the current availability status
                  const requestOptions = {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                    headers: { "Content-Type": "application/json" },
                  };

                  // console.log(
                  //   "Checking-in ",
                  //   rowTag,
                  //   " into db with these values: ",
                  //   payload.status,
                  //   " and ",
                  //   payload.timestamp,
                  //   " for dbRowIdx ",
                  //   dbRowIdx,
                  //   " and tblRowIdx ",
                  //   tblRowIdx
                  // ); //debugging

                  // Fetch it to the backend API with a new status
                  fetch(`${apiServer}/patchStatus/${dbRowIdx}`, requestOptions)
                    .then((response) => response.json());
                  // .then(response => console.log(response));

                  // Update row's 'Status' to "available"
                  updateMyData(tblRowIdx, "status", payload.status);

                  // Update the row's 'Timestamp' to the current time
                  updateMyData(tblRowIdx, "timestamp", currentDateAndTime);
                }
              }}
            >
              {btnVal}
            </Button>
          );
        },
      },

      {
        Header: "Service Tag",
        accessor: "serviceTag",
        Cell: Server_Inventory,
      },
      {
        Header: "System",
        accessor: "system",
      },
      {
        Header: "IP Address",
        accessor: "ip",
        Cell: IP_Hyperlink,
      },
      // {
      //   Header: "Host Name",
      //   accessor: "hostname",
      // },
      {
        Header: "Model",
        accessor: "model",
      },
      {
        Header: "Location",
        accessor: "location",
        //
      },
      // {
      //   Header: "Generation",
      //   accessor: "generation",
      // },
      {
        Header: "Status",
        accessor: "status",
      },
      // {
      //   Header: "TimeStamp",
      //   accessor: "timestamp",
      //   sortType: "basic",
      //   // filter: "fuzzyText"
      // },
      {
        Header: "Comments",
        accessor: "comments",
        Cell: EditableComments,
        disableFilters: true,
      },
    ],
    [userInfo.name]
  );

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // When data gets updated with this function, set a flag
    // to disable all of the auto resetting
    skipPageResetRef.current = true;
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  // After data changes, we turn the flag back off
  // so that if data actually changes when we're not
  // editing it, the page is reset
  React.useEffect(() => {
    // After the table has updated, always remove the flag
    skipPageResetRef.current = false;
  });

  React.useEffect(() => {
    searchArrLength = 0;
  }, []);

  React.useEffect(() => {
    // If search results are not empty then run a db query
    // and set returned data for the table to display
    if (searchArrLength > 0) {
      fetchServers(searchArr).then((data) => {
        // console.log("On useEffect fetch returned: ");
        // console.log(data); //debugging
        setData(
          data.map((item) => {
            return item;
          })
        );
      });
    } else {
      // ..otherwise set data for the table to an empty array
      setData([]);
    }
    setLoading({ done: true });
  }, [searchArr]);

  return (
    <React.Fragment>
      <SearchCard />
      <Tables
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        loading={loading}
        skipPageResetRef={skipPageResetRef}
      />
    </React.Fragment>
  );
}

export default SearchInventory;
