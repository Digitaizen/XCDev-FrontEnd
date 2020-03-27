import React from 'react'
import TableHook from "../../components/Table/Table.js"
import { useEffect } from 'react';


const columnNames = [
    { name: "Service Tag", key: "1" },
    { name: "System", key: "2" },
    { name: "Cluster", key: "3" },
    { name: "Model", key: "4" },
    { name: "iDRAC", key: "5" },
    { name: "HV", key: "6" },
    { name: "CVM", key: "7" },
    { name: "Building", key: "8" },
    { name: "Rack", key: "9" },
    { name: "Rack U", key: "10" },
    { name: "Current Status", key: "11" },
    { name: "Comment", key: "12" }
  ];

const LabInventory = () => {
    return (
        <TableHook columnNames={columnNames} />
    )
}

export default LabInventory;
