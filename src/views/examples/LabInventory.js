import React from 'react'
import TableComponent from "../../components/Table/Table"


const systemInventory = {
    serviceTag: '09P1D25',
    system: 'DellPowerEdge740xd',
    model: '6320-1',
    idrac: '100.80.146.94',
    building: 'PS4',
    rack: 'C2',
    rackU: '33',
    currentStatus: 'Available, 2019-11-10 00:08:48',
    comment: 'Blade 1'
}

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
        <TableComponent columnNames={columnNames} systemInventory={systemInventory} />
    )
}

export default LabInventory;
