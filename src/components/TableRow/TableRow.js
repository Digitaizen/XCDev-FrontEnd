import React from "react";
import { Media } from "reactstrap";
import {
  Button,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle
} from "reactstrap";

const TableRow = ({
  serviceTag,
  system,
  cluster,
  model,
  idrac,
  hv,
  cvm,
  building,
  rack,
  rackU,
  currentStatus,
  comment
}) => {
  // const [tableRow, setTableRow] = useState(" ")
  return (
    <tr>
      <th scope="row">
        <Media className="align-items-center">
          <img
            // className="avatar rounded-circle mr-3"
            className="icon fas fa-user"
            alt="..."
            src={require("assets/img/theme/icons8-server-96.png")}
          />
          <Media>
            <span className="mb-0 text-sm">{serviceTag}</span>
          </Media>
        </Media>
      </th>
      {/* Mapping over each key of the object and dynamically create td for each */}
      {/* {Object.keys(props.systemInventory).map((key) => (
            key !== "serviceTag" ?
            (<td key={key.name}>{props.systemInventory[key]}</td>) : null

        ) )} */}
      <td>{system}</td>
      <td>{cluster}</td>
      <td>{model}</td>
      <td>{idrac}</td>
      <td>{hv}</td>
      <td>{cvm}</td>
      <td>{building}</td>
      <td>{rack}</td>
      <td>{rackU}</td>
      <td>{currentStatus}</td>
      <td>{comment}</td>
      <td>
        <Button color="info" type="button">
          Check-out
        </Button>
      </td>
      <td>
        <UncontrolledDropdown>
          <DropdownToggle
            className="btn-icon-only text-light"
            href="#pablo"
            role="button"
            size="sm"
            color=""
            onClick={e => e.preventDefault()}
          >
            <i className="fas fa-ellipsis-v" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-arrow" right>
            <DropdownItem href="#pablo" onClick={e => e.preventDefault()}>
              Reset iDRAC
            </DropdownItem>
            <DropdownItem href="#pablo" onClick={e => e.preventDefault()}>
              Restart Server
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </td>
    </tr>
  );
};

export default TableRow;
