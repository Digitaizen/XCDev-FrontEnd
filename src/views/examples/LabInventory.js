/*!

=========================================================
* Argon Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState, useRef, useEffect } from "react";
import { useTable, useRowSelect } from "react-table";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import * as dotLoading from "../../components/Loading/dotLoading.json";

// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Table,
  Container,
  Row,
  UncontrolledTooltip
} from "reactstrap";
// core components
import Header from "../../components/Headers/Header.js";

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const onChange = e => {
    setValue(e.target.value);
  };

  //   We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  //removed onBlur={onBlur}

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

// eslint-disable-next-line
// const IndeterminateCheckbox = React.forwardRef(
//   ({ indeterminate, ...rest }, ref) => {
//     const defaultRef = React.useRef();
//     const resolvedRef = ref || defaultRef;
//     const [value, setValue] = useState({ ...rest }.checked);
//     React.useEffect(() => {
//       resolvedRef.current.indeterminate = indeterminate;
//     }, [resolvedRef, indeterminate]);

//     const handleValue = () => {
//       const requestOptions = {
//         method: "PATCH",
//         body: JSON.stringify({ status: true }),
//         headers: { "Content-Type": "application/json" }
//       };
//       fetch("http://localhost:3001/users", requestOptions)
//         .then(response => response.json())
//         .then(response => console.log(response));
//       // if (value) setValue(false);
//       // else setValue(true);
//     };
//     // console.log(defaultRef);
//     return (
//       <>
//         <Button
//           type="checkbox"
//           ref={resolvedRef}
//           {...rest}
//           onClick={handleValue}
//           value={value}
//           style={{ backgroundColor: value ? "#fb6340" : "lightgreen" }}
//         >
//           {value ? "Check In" : "Check Out"}
//         </Button>
//       </>
//     );
//   }
// );

const CheckButton = row => {
  const [checkButton, setcheckButton] = useState({ value: "" });
  const [initialLoadState, setInitialLoadState] = useState(false);

  //Using ref to make useEffect NOT run the first render for the "PATCH" api call
  const isFirstRun = useRef(false);

  //Fetching checkButton data from the database, CheckIn or CheckOut
  useEffect(() => {
    fetch(`http://localhost:3001/users/${row.id}`)
      .then(res => res.json())
      .then(({ status }) => setcheckButton({ value: status }));
  }, [row.id]);

  //Updating the status property of the checkButton on external database
  useEffect(() => {
    if (initialLoadState === true) {
      //Using PATCH call to only update the status property in the db
      const requestOptions = {
        method: "PATCH",
        body: JSON.stringify({ status: checkButton.value }),
        headers: { "Content-Type": "application/json" }
      };

      fetch(`http://localhost:3001/users/${row.id}`, requestOptions)
        .then(response => response.json())
        .then(response => console.log(response));

      console.log("update fetch RowId:", row.id);
      console.log("New Value:", checkButton.value);
    } else {
      return;
      // isFirstRun.current = true;
    }
  }, [checkButton.value, initialLoadState, row.id]);

  //onClick function to switch the checkButton property
  const handleClick = () => {
    setInitialLoadState(true);
    setcheckButton(prev => ({
      value: prev.value === "CheckOut" ? "CheckIn" : "CheckOut"
    }));

    console.log("Old Value:", checkButton.value);
  };

  return (
    <>
      <Button
        key={row.id}
        id={row.id}
        onClick={handleClick}
        value={checkButton.value}
        style={{
          backgroundColor:
            checkButton.value === "CheckOut" ? "lightgreen" : "#fb6340"
        }}
      >
        {checkButton.value}
      </Button>
      <pre>
        <code>{JSON.stringify(checkButton, null, 2)}</code>
      </pre>
    </>
  );
};

function Tables({ columns, data, updateMyData, loading }) {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: dotLoading.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const {
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow
    // page,
    // canPreviousPage,
    // canNextPage,
    // pageOptions,
    // pageCount,
    // gotoPage,
    // nextPage,
    // previousPage,
    // setPageSize,
    // selectedFlatRows,
    // state: { selectedRowIds },
    // state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      updateMyData
    },
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: "selection",
          Header: () => <div>CheckIn/Checkout</div>,
          Cell: ({ row }) => (
            <CheckButton {...row} />
            // <div>
            //   <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            // </div>
          )
        },
        ...columns
      ]);
    }
  );
  // console.log(rows);
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Card tables</h3>
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
                <Table bordered hover responsive fluid {...getTableProps()}>
                  <thead>
                    {headerGroups.map(headerGroup => (
                      <tr
                        key={headerGroup.id}
                        {...headerGroup.getHeaderGroupProps()}
                      >
                        {headerGroup.headers.map(column => (
                          <th key={column.id} {...column.getHeaderProps()}>
                            {column.render("Header")}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                      prepareRow(row);
                      return (
                        <tr key={row.id} id={row.id} {...row.getRowProps()}>
                          {row.cells.map(cell => {
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
              )}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

function LabInventory() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Service Tag",
        accessor: "serviceTag"
      },
      {
        Header: "IP Address",
        accessor: "idracIp"
      },

      {
        Header: "Host Name",
        accessor: "hostName"
      },
      {
        Header: "Model",
        accessor: "model"
      },
      {
        Header: "Comments",
        Cell: EditableCell
      }
    ],
    []
  );

  const [data, setData] = React.useState(
    [] || localStorage.getItem("tableData")
  );
  const [loading, setLoading] = useState({ done: undefined });

  const updateMyData = (rowIndex, columnId, value) => {
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value
          };
        }
        return row;
      })
    );
  };

  React.useEffect(() => {
    localStorage.setItem("tableData", data);
  }, [data]);

  React.useMemo(() => {
    fetch("/getServers")
      .then(res => res.json())
      .then(data =>
        setData(
          data.map(item => {
            return {
              idracIp: item.ip,
              serviceTag: item.data.System.SKU,
              model: item.data.System.Model,
              hostName: item.data.System.HostName
            };
          })
        )
      );
  }, []);

  return (
    <React.Fragment>
      <Tables
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        loading={loading}
      />
    </React.Fragment>
  );
}

export default LabInventory;
