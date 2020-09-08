import React, { useState, useEffect } from "react";
import { Component } from "react";
import Select from 'react-select';
import jsonInv from 'assets/hw_inventory_3_nodes.json';
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
// import { UserInfoContext } from "../../context/UserInfoContext";
import matchSorter from "match-sorter";
// import PropTypes from "prop-types";

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
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
  FormGroup,
  Label
} from "reactstrap";

import Form from "react-bootstrap/Form";

// core components
import Header from "../../components/Headers/Header.js";
// const apiServer = "http://100.80.149.19:8080"; // for production build
const apiServer = process.env.REACT_APP_API_SERVER;
// const apiServer = ""; // for local dev work

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

// Function that returns data size in short, human-readable format
function formatSize(x) {
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let l = 0, n = parseInt(x, 10) || 0;
  while (n >= 1024 && ++l) {
    n = n / 1024;
  }
  return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

// Function to check the existence of a key in an object
function keyExists(obj, key) {
  let val;
  let objKeys = Object.keys(obj);
  objKeys.includes(key) ? val = true : val = false;
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
      <a target="_blank" href={iDRAC_link}>
        {iDRAC_IP}
      </a>
    </div>
  );
};


// Turn server 'Service Tag' into a hyperlink to its inventory text file (temp)
const Server_Inventory = (props) => {
  let server_tag = props.cell.row.original.serviceTag;
  let server = `${props.cell.row.original.ip}.txt`;
  let server_info = "http://100.80.149.97/DellReServer/inventory/Latest/" + server;
  return (
    <div>
      <a target="_blank" href={server_info}>
        {server_tag}
      </a>
    </div>
  );
};

// Get data for all Search Inventory dropdown lists
function getDropdownData(jsonData) {
  // Create top level object with subitem objects for each component
  let allData = {
    SystemInfo: {},
    ProcessorInfo: {},
    MemoryInfo: {},
    StorageDisksInfo: {},
    StorageControllersInfo: {},
    NetworkDevicesInfo: {},
    PowerSuppliesInfo: {},
    BackplaneInfo: {}
  };

  // Create arrays for each dropdown
  const arrSysBios = [];
  const arrDriveMakes = [];
  const arrDriveModels = [];
  const arrDriveSizes = [];
  const arrDriveWear = [];
  const arrProcessorMakes = [];
  const arrProcessorModels = [];
  const arrProcessorSpeeds = [];
  const arrProcessorCores = [];
  const arrControllerNames = [];
  const arrControllerFWs = [];
  const arrControllerPCIslots = [];
  const arrDimmMakes = [];
  const arrDimmModels = [];
  const arrDimmRanks = [];
  const arrDimmSizes = [];
  const arrDimmSpeeds = [];
  const arrNicMakes = [];
  const arrNicModels = [];
  const arrNicFWs = [];

  // Create maps to store only unique values for each key
  const mapSysBios = new Map();
  const mapDriveMakers = new Map();
  const mapDriveModels = new Map();
  const mapDriveSizes = new Map();
  const mapDriveWear = new Map();
  const mapProcessorMakes = new Map();
  const mapProcessorModels = new Map();
  const mapProcessorSpeeds = new Map();
  const mapProcessorCores = new Map();
  const mapControllerNames = new Map();
  const mapControllerFWs = new Map();
  const mapControllerPCIslots = new Map();
  const mapDimmMakes = new Map();
  const mapDimmModels = new Map();
  const mapDimmRanks = new Map();
  const mapDimmSizes = new Map();
  const mapDimmSpeeds = new Map();
  const mapNicMakes = new Map();
  const mapNicModels = new Map();
  const mapNicFWs = new Map();


  // Loop through each server's json data in the array
  jsonData.forEach((server) => {
    // System Information -------------------------------------------------------------------------
    // Check if the value already on the list and if not then add it
    if (!mapSysBios.has(server.SystemInformation.BiosVersion)) {
      mapSysBios.set(server.SystemInformation.BiosVersion, true);    // set any value to Map

      // Add this unique value to its array
      arrSysBios.push({
        value: server.SystemInformation.BiosVersion,
        label: server.SystemInformation.BiosVersion
      });
    };

    // Storage Disks Information ------------------------------------------------------------------
    // Get the names of the drives
    let sdiKeys = Object.keys(server.StorageDisksInformation);

    // Loop through drives, get then add unique data to array
    sdiKeys.forEach((driveName) => {
      if (!mapDriveMakers.has(server.StorageDisksInformation[driveName].Manufacturer)) {
        mapDriveMakers.set(server.StorageDisksInformation[driveName].Manufacturer, true);    // set any value to Map

        // Add this unique value to its array
        arrDriveMakes.push({
          value: server.StorageDisksInformation[driveName].Manufacturer,
          label: server.StorageDisksInformation[driveName].Manufacturer
        });
      };
      if (!mapDriveModels.has(server.StorageDisksInformation[driveName].Model)) {
        mapDriveModels.set(server.StorageDisksInformation[driveName].Model, true);    // set any value to Map

        // Add this unique value to its array
        arrDriveModels.push({
          value: server.StorageDisksInformation[driveName].Model,
          label: server.StorageDisksInformation[driveName].Model
        });
      };
      if (!mapDriveSizes.has(server.StorageDisksInformation[driveName].CapacityBytes)) {
        mapDriveSizes.set(server.StorageDisksInformation[driveName].CapacityBytes, true);    // set any value to Map

        // Add this unique value to its array
        let formValue = formatSize(server.StorageDisksInformation[driveName].CapacityBytes);
        arrDriveSizes.push({
          value: formValue,
          label: formValue
        });
      };
      if (!mapDriveWear.has(server.StorageDisksInformation[driveName].PredictedMediaLifeLeftPercent)) {
        mapDriveWear.set(server.StorageDisksInformation[driveName].PredictedMediaLifeLeftPercent, true);    // set any value to Map

        // Add this unique value to its array
        arrDriveWear.push({
          value: server.StorageDisksInformation[driveName].PredictedMediaLifeLeftPercent,
          label: server.StorageDisksInformation[driveName].PredictedMediaLifeLeftPercent
        });
      };
    });

    // Processors Information ---------------------------------------------------------------------
    // Get the names of the processors
    let piKeys = Object.keys(server.ProcessorInformation);

    // Loop through processors, get then add unique data to array
    piKeys.forEach((processorName) => {
      if (!mapProcessorMakes.has(server.ProcessorInformation[processorName].Manufacturer)) {
        mapProcessorMakes.set(server.ProcessorInformation[processorName].Manufacturer, true);    // set any value to Map

        // Add this unique value to its array
        arrProcessorMakes.push({
          value: server.ProcessorInformation[processorName].Manufacturer,
          label: server.ProcessorInformation[processorName].Manufacturer
        });
      };
      if (!mapProcessorModels.has(server.ProcessorInformation[processorName].Model)) {
        mapProcessorModels.set(server.ProcessorInformation[processorName].Model, true);    // set any value to Map

        // Add this unique value to its array
        arrProcessorModels.push({
          value: server.ProcessorInformation[processorName].Model,
          label: server.ProcessorInformation[processorName].Model
        });
      };
      if (!mapProcessorSpeeds.has(server.ProcessorInformation[processorName].MaxSpeedMhz)) {
        mapProcessorSpeeds.set(server.ProcessorInformation[processorName].MaxSpeedMhz, true);    // set any value to Map

        // Add this unique value to its array
        arrProcessorSpeeds.push({
          value: server.ProcessorInformation[processorName].MaxSpeedMHz,
          label: server.ProcessorInformation[processorName].MaxSpeedMHz
        });
      };
      if (!mapProcessorCores.has(server.ProcessorInformation[processorName].TotalCores)) {
        mapProcessorCores.set(server.ProcessorInformation[processorName].TotalCores, true);    // set any value to Map

        // Add this unique value to its array
        arrProcessorCores.push({
          value: server.ProcessorInformation[processorName].TotalCores,
          label: server.ProcessorInformation[processorName].TotalCores
        });
      };
    });

    // Storage Controllers Information ------------------------------------------------------------
    // Get the names of the controllers
    let ciKeys = Object.keys(server.StorageControllerInformation);

    // Loop through controllers, get then add unique data to array
    ciKeys.forEach((controllerName) => {
      if (!mapControllerNames.has(server.StorageControllerInformation[controllerName].Name)) {
        mapControllerNames.set(server.StorageControllerInformation[controllerName].Name, true);    // set any value to Map

        // Add this unique value to its array
        arrControllerNames.push({
          value: server.StorageControllerInformation[controllerName].Name,
          label: server.StorageControllerInformation[controllerName].Name
        });
      };

      // 1st check if the key exists then add it to a new key array
      let newSCkeyArr = [];
      if (keyExists(server.StorageControllerInformation[controllerName], "StorageControllers"))
        newSCkeyArr.push(controllerName);
      else
        console.log(`System '${server.SystemInformation.SKU}' controller ${controllerName} does not have the 'StorageControllers' key`);

      // Now, loop through the new key array to find the data seeked
      newSCkeyArr.forEach(cName => {
        if (server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0] === "")
          console.log(`System '${server.SystemInformation.SKU}' controller ${cName} does not have the 'Firmware Version' data`);
        else {
          if (!mapControllerFWs.has(server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0])) {
            mapControllerFWs.set(server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0], true);    // set any value to Map

            // Add this unique value to its array
            arrControllerFWs.push({
              value: server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0],
              label: server.StorageControllerInformation[cName].StorageControllers.FirmwareVersion[0]
            });
          };
        }
      });

      // 1st check if the key exists then add it to a new key array
      let newOEMkeyArr = [];
      if (keyExists(server.StorageControllerInformation[controllerName], "Oem")) {
        newOEMkeyArr.push(controllerName);
      } else {
        console.log(`System '${server.SystemInformation.SKU}' controller ${controllerName} does not have the 'Oem' key`);
      };

      // Now, loop through the new key array to find the data seeked
      newOEMkeyArr.forEach(cName => {
        if (server.StorageControllerInformation[cName].Oem.Dell.DellController.PCISlot === null) {
          console.log(`System '${server.SystemInformation.SKU}' controller ${controllerName} does not have 'PCISlot' data`);
        } else {
          if (!mapControllerPCIslots.has(server.StorageControllerInformation[cName].Oem.Dell.DellController.PCISlot)) {
            mapControllerPCIslots.set(server.StorageControllerInformation[cName].Oem.Dell.DellController.PCISlot, true);    // set any value to Map

            // Add this unique value to its array
            arrControllerPCIslots.push({
              value: server.StorageControllerInformation[cName].Oem.Dell.DellController.PCISlot,
              label: server.StorageControllerInformation[cName].Oem.Dell.DellController.PCISlot
            });
          };
        };
      });
    });

    // Memory Information -------------------------------------------------------------------------
    // Get the names of the DIMMs
    let miKeys = Object.keys(server.MemoryInformation);

    // Loop through keys and store unique data
    miKeys.forEach((dimmSocket) => {
      if (!mapDimmMakes.has(server.MemoryInformation[dimmSocket].Manufacturer)) {
        mapDimmMakes.set(server.MemoryInformation[dimmSocket].Manufacturer, true);    // set any value to Map

        // Add this unique value to its array
        arrDimmMakes.push({
          value: server.MemoryInformation[dimmSocket].Manufacturer,
          label: server.MemoryInformation[dimmSocket].Manufacturer
        });
      };

      if (!mapDimmModels.has(server.MemoryInformation[dimmSocket].MemoryDeviceType)) {
        mapDimmModels.set(server.MemoryInformation[dimmSocket].MemoryDeviceType, true);    // set any value to Map

        // Add this unique value to its array
        arrDimmModels.push({
          value: server.MemoryInformation[dimmSocket].MemoryDeviceType,
          label: server.MemoryInformation[dimmSocket].MemoryDeviceType
        });
      };

      if (!mapDimmRanks.has(server.MemoryInformation[dimmSocket].RankCount)) {
        mapDimmRanks.set(server.MemoryInformation[dimmSocket].RankCount, true);    // set any value to Map

        // Add this unique value to its array
        arrDimmRanks.push({
          value: server.MemoryInformation[dimmSocket].RankCount,
          label: server.MemoryInformation[dimmSocket].RankCount
        });
      };

      if (!mapDimmSizes.has(server.MemoryInformation[dimmSocket].CapacityMiB)) {
        mapDimmSizes.set(server.MemoryInformation[dimmSocket].CapacityMiB, true);    // set any value to Map

        // Add this unique value to its array
        let formValue = formatSize((server.MemoryInformation[dimmSocket].CapacityMiB) * 1000);
        arrDimmSizes.push({
          value: formValue,
          label: formValue
        });
      };

      if (!mapDimmSpeeds.has(server.MemoryInformation[dimmSocket].OperatingSpeedMhz)) {
        mapDimmSpeeds.set(server.MemoryInformation[dimmSocket].OperatingSpeedMhz, true);    // set any value to Map

        // Add this unique value to its array
        arrDimmSpeeds.push({
          value: server.MemoryInformation[dimmSocket].OperatingSpeedMhz,
          label: server.MemoryInformation[dimmSocket].OperatingSpeedMhz
        });
      };
    });

    // Network Device Information -----------------------------------------------------------------
    // Store unique data
    if (!mapNicMakes.has(server.NetworkDeviceInformation.Manufacturer)) {
      mapNicMakes.set(server.NetworkDeviceInformation.Manufacturer, true);    // set any value to Map

      // Add this unique value to its array
      arrNicMakes.push({
        value: server.NetworkDeviceInformation.Manufacturer,
        label: server.NetworkDeviceInformation.Manufacturer
      });
    };
    // console.log(arrNicMakes);

    if (!mapNicModels.has(server.NetworkDeviceInformation.Model)) {
      mapNicModels.set(server.NetworkDeviceInformation.Model, true);    // set any value to Map

      // Add this unique value to its array
      arrNicModels.push({
        value: server.NetworkDeviceInformation.Model,
        label: server.NetworkDeviceInformation.Model
      });
    };

    if (!mapNicFWs.has(server.NetworkDeviceInformation.FirmwarePackageVersion)) {
      mapNicFWs.set(server.NetworkDeviceInformation.FirmwarePackageVersion, true);    // set any value to Map

      // Add this unique value to its array
      arrNicFWs.push({
        value: server.NetworkDeviceInformation.FirmwarePackageVersion,
        label: server.NetworkDeviceInformation.FirmwarePackageVersion
      });
    };
  });

  // Store data in the top-level object
  allData["SystemInfo"]["Bios"] = arrSysBios;
  allData["StorageDisksInfo"]["Manufacturers"] = arrDriveMakes;
  allData["StorageDisksInfo"]["Models"] = arrDriveModels;
  allData["StorageDisksInfo"]["Sizes"] = arrDriveSizes;
  allData["StorageDisksInfo"]["Wear"] = arrDriveWear;
  allData["ProcessorInfo"]["Manufacturers"] = arrProcessorMakes;
  allData["ProcessorInfo"]["Models"] = arrProcessorModels;
  allData["ProcessorInfo"]["Speeds"] = arrProcessorSpeeds;
  allData["ProcessorInfo"]["Cores"] = arrProcessorCores;
  allData["StorageControllersInfo"]["Names"] = arrControllerNames;
  allData["StorageControllersInfo"]["FWs"] = arrControllerFWs;
  allData["StorageControllersInfo"]["PCISlots"] = arrControllerPCIslots;
  allData["MemoryInfo"]["Manufacturers"] = arrDimmMakes;
  allData["MemoryInfo"]["Models"] = arrDimmModels;
  allData["MemoryInfo"]["Ranks"] = arrDimmRanks;
  allData["MemoryInfo"]["Sizes"] = arrDimmSizes;
  allData["MemoryInfo"]["Speeds"] = arrDimmSpeeds;
  allData["NetworkDevicesInfo"]["Manufacturers"] = arrNicMakes;
  allData["NetworkDevicesInfo"]["Models"] = arrNicModels;
  allData["NetworkDevicesInfo"]["FWs"] = arrNicFWs;

  // Debugging
  console.log(arrSysBios);
  console.log(arrDriveMakes);
  console.log(arrDriveModels);
  console.log(arrDriveSizes);
  console.log(arrDriveWear);
  console.log(arrProcessorMakes);
  console.log(arrProcessorModels);
  console.log(arrProcessorSpeeds);
  console.log(arrProcessorCores);
  console.log(arrControllerNames);
  console.log(arrControllerFWs);
  console.log(arrControllerPCIslots);
  console.log(arrDimmMakes);
  console.log(arrDimmModels);
  console.log(arrDimmRanks);
  console.log(arrDimmSizes);
  console.log(arrDimmSpeeds);
  console.log(arrNicMakes);
  console.log(arrNicModels);
  console.log(arrNicFWs);

  // Return object with data for all dropdowns
  return allData;
};


function Tables({ columns, data, updateMyData, loading, skipPageResetRef }) {
  // Set hooks for dropdowns
  const [biosOptions, setSelectedBiosOption] = useState([]);
  const [driveMakers, setSelectedDriveMakers] = useState([]);
  const [driveModels, setSelectedDriveModels] = useState([]);
  const [driveSizes, setSelectedDriveSizes] = useState([]);
  const [driveWear, setSelectedDriveWear] = useState([]);
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


  // Populate dropdown lists upon load
  useEffect(() => {
    let ddData = getDropdownData(jsonInv);
    setSelectedBiosOption(ddData.SystemInfo.Bios);
    setSelectedDriveMakers(ddData.StorageDisksInfo.Manufacturers);
    setSelectedDriveModels(ddData.StorageDisksInfo.Models);
    setSelectedDriveSizes(ddData.StorageDisksInfo.Sizes);
    setSelectedDriveWear(ddData.StorageDisksInfo.Wear);
    setSelectedProcessorMakes(ddData.ProcessorInfo.Manufacturers);
    setSelectedProcessorModels(ddData.ProcessorInfo.Models);
    setSelectedProcessorSpeeds(ddData.ProcessorInfo.Speeds);
    setSelectedProcessorCores(ddData.ProcessorInfo.Cores);
    setSelectedControllerNames(ddData.StorageControllersInfo.Names);
    setSelectedControllerFWs(ddData.StorageControllersInfo.FWs);
    setSelectedControllerPCIslots(ddData.StorageControllersInfo.PCISlots);
    setSelectedMemoryMakers(ddData.MemoryInfo.Manufacturers);
    setSelectedMemoryModels(ddData.MemoryInfo.Models);
    setSelectedMemoryRanks(ddData.MemoryInfo.Ranks);
    setSelectedMemorySizes(ddData.MemoryInfo.Sizes);
    setSelectedMemorySpeeds(ddData.MemoryInfo.Speeds);
    setSelectedNicMakers(ddData.NetworkDevicesInfo.Manufacturers);
    setSelectedNicModels(ddData.NetworkDevicesInfo.Models);
    setSelectedNicFWs(ddData.NetworkDevicesInfo.FWs);
  }, []);

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
    useRowSelect
  );

  return (
    <>
      <Header />
      {/* Page content */}
      <div className="header bg-gradient-info pb-8 pt-3 pt-md-10">
        <Container className="mt--9" fluid={true} >
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
                          {/* <Label for="exampleSelect">Bios</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select BIOS Version..."
                            options={biosOptions}
                            onChange={(selectedOption) =>
                              setSelectedBiosOption(selectedOption.value)
                            }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">iDRAC Firmware</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select firmware..."
                          // options={}
                          // onChange={(selectedOption) =>
                          //   setSelectedSysFW(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">CPLD</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select CPLD..."
                          // options={}
                          // onChange={(selectedOption) =>
                          //   setSelectedSysCPLD(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">DIMMs</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select DIMMs..."
                          // options={}
                          // onChange={(selectedOption) =>
                          //   setSelectedSysDIMM(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Type of Memory</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select type..."
                          // options={biosOptions}
                          // onChange={(selectedOption) =>
                          //   setSelectedSysMemType(selectedOption.value)
                          // }
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
                          {/* <Label for="exampleSelect">Make</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select make..."
                            options={driveMakers}
                          // onChange={(selectedOption) =>
                          //   setSelectedDriveMakers(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Model</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select model..."
                            options={driveModels}
                          // onChange={(selectedOption) =>
                          //   setSelectedDriveModels(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Size</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select size..."
                            options={driveSizes}
                          // onChange={(selectedOption) =>
                          //   setSelectedDriveSizes(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Wear Level</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select wear level..."
                            options={driveWear}
                          // onChange={(selectedOption) =>
                          //   setSelectedDriveWear(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Firmware</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select firmware..."
                          // options={}
                          // onChange={(selectedOption) =>
                          //   setSelectedDriveFW(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Serial Number</Label> */}
                          <Input type="text" name="search" id="exampleText" placeholder="Enter serial #" />
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
                          {/* <Label for="exampleSelect">Make</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select make..."
                            options={processorMakes}
                          // onChange={(selectedOption) =>
                          //   setSelectedProcessorMakes(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Model</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select model..."
                            options={processorModels}
                          // onChange={(selectedOption) =>
                          //   setSelectedProcessorModels(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Clock Speed</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select speed.."
                            options={processorSpeeds}
                          // onChange={(selectedOption) =>
                          //   setSelectedProcessorSpeeds(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Core Count</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select core count.."
                            options={processorCores}
                          // onChange={(selectedOption) =>
                          //   setSelectedProcessorCores(selectedOption.value)
                          // }
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
                          {/* <Label for="exampleSelect">Name</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select Name..."
                            options={controllerNames}
                          // onChange={(selectedOption) =>
                          //   setSelectedControllerNames(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Firmware</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select firmware..."
                            options={controllerFWs}
                          // onChange={(selectedOption) =>
                          //   setSelectedControllerFWs(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">PCI Slot</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select PCI slot..."
                            options={controllerPCIslots}
                          // onChange={(selectedOption) =>
                          //   setSelectedControllerPCIslots(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">SAS Address</Label> */}
                          <Input type="text" name="search" id="exampleText" placeholder="Enter SAS address.." />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Serial Number</Label> */}
                          <Input type="text" name="search" id="exampleText" placeholder="Enter serial #.." />
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
                          {/* <Label for="exampleSelect">Manufacturer</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select make.."
                            options={memoryMakers}
                          // onChange={(selectedOption) =>
                          //   setSelectedMemoryMakers(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Model</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select model..."
                            options={memoryModels}
                          // onChange={(selectedOption) =>
                          //   setSelectedMemoryModels(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Rank</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select rank..."
                            options={memoryRanks}
                          // onChange={(selectedOption) =>
                          //   setSelectedMemoryRanks(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={1}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Size</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select size..."
                            options={memorySizes}
                          // onChange={(selectedOption) =>
                          //   setSelectedMemorySizes(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Speed</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select speed..."
                            options={memorySpeeds}
                          // onChange={(selectedOption) =>
                          //   setSelectedMemorySpeeds(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Part Number</Label> */}
                          <Input type="text" name="search" id="exampleText" placeholder="Enter part #" />
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
                          {/* <Label for="exampleSelect">Manufacturer</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select make.."
                            options={nicMakers}
                          // onChange={(selectedOption) =>
                          //   setSelectedNicMakers(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Model</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select model..."
                            options={nicModels}
                          // onChange={(selectedOption) =>
                          //   setSelectedNicModels(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Firmware</Label> */}
                          <Select
                            className="mt-1 col-md-15 col-offset-8"
                            placeholder="Select firmware..."
                            options={nicFWs}
                          // onChange={(selectedOption) =>
                          //   setSelectedNicFWs(selectedOption.value)
                          // }
                          />
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup>
                          {/* <Label for="exampleSelect">Port Number</Label> */}
                          <Input type="text" name="search" id="exampleText" placeholder="Enter port #" />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardHeader>
              </Card>
            </row>
          </div>
        </Container>
        {/* Table */}
      </div>
      {/* Page content */}
      <Container className="mt--7" fluid={true} style={{
        border: "none",
        margin: "1px",
        padding: "1px",
        width: "100%",
        height: "100%",
        resize: "none",
        alignSelf: true
      }}>
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
    </>
  );
}

function SearchInventory() {
  // const { userInfo } = useContext(UserInfoContext);
  const userInfo = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = useState({ done: undefined });
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
                  fetch(
                    `${apiServer}/patchStatus/${dbRowIdx}`,
                    requestOptions
                  ).then((response) => response.json());
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
        Cell: Server_Inventory
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

  useEffect(() => {
    fetch(`${apiServer}/getServers`)
      .then((res) => res.json())
      .then((data) => {
        setData(
          data.map((item) => {
            return item;
          })
        );
        setLoading({ done: true });
      });
  }, []);

  return (
    <React.Fragment>
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
