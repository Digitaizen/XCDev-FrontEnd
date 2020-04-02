import React from 'react'
import { Media } from "reactstrap";


const TableRow = (props) => {
    
    // const [tableRow, setTableRow] = useState(" ")
    console.log(props)
    return(

        <tr>
        <th scope="row">
          <Media className="align-items-center">
              <img
              className="avatar rounded-circle mr-3"
                alt="..."
                src={require("assets/img/theme/bootstrap.jpg")}
              />
            <Media>
              <span className="mb-0 text-sm">
                {props.systemInventory.serviceTag}
              </span>
            </Media>
          </Media>
        </th>
        {/* {Object.keys(props.systemInventory).map((key) => (
            key !== "serviceTag" ?
            (<td key={key.name}>{props.systemInventory[key]}</td>) : null

        ) )} */}
        <td>{props.systemInventory.system}</td>
        <td>{props.systemInventory.model}</td>
        <td>{props.systemInventory.idrac}</td>
        <td>{props.systemInventory.building}</td>
        <td>{props.systemInventory.rack}</td>
        <td>{props.systemInventory.rackU}</td>
        <td>{props.systemInventory.currentStatus}</td>
        <td>{props.systemInventory.comment}</td>
        </tr>
    )
}

export default TableRow;