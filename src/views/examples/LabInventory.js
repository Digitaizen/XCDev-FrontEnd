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
import React, { useState, useEffect, useContext } from "react";
import { useTable, useRowSelect } from "react-table";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import * as dotLoading from "../../components/Loading/dotLoading.json";
import { UserInfoContext } from "../../context/UserInfoContext";

// reactstrap components
import { Button, Card, CardHeader, Table, Container, Row } from "reactstrap";
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

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

function Tables({ columns, data, updateMyData, loading }) {
  //default options defined for the lottie file loading animation
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
  } = useTable(
    {
      columns,
      data,
      updateMyData
    },
    useRowSelect
  );

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
                <h3 className="mb-0">Lab Inventory</h3>
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
                <Table bordered hover responsive {...getTableProps()}>
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
  const { userInfo } = useContext(UserInfoContext);

  const columns = React.useMemo(
    () => [
      {
        Header: "Action",
        // eslint-disable-next-line
        Cell: props => {
          // return (<CheckButton {...props} />)
          let rowIdx = props.cell.row.original._id;
          let rowStatus = props.cell.row.original.status;
          let btnId = "btn" + rowIdx;
          let btnVal = "";

          // Get current timestamp
          let currentDateAndTime = new Date().toLocaleString();

          // Set payload for PATCH req to db
          let payload;

          // Set action button props based on db's 'Status' value for each row
          if (rowStatus === "available") {
            btnVal = "Check-Out";
          } else if (rowStatus === userInfo.name) {
            btnVal = "Check-In";
          } else if (rowStatus !== userInfo.name) {
            btnVal = "n/a";
          }

          // Build the action button for each row with the props set above
          return (
            <Button
              style={{
                minWidth: 100,
                minHeight: 30,
                backgroundColor:
                  btnVal === "Check-Out" ? "lightgreen" : "#fb6340"
              }}
              id={btnId}
              value={btnVal}
              disabled={
                rowStatus === "available" || rowStatus === userInfo.name
                  ? false
                  : true
              }
              onClick={() => {
                //Checking if the user has the ability to Check-Out a server
                fetch(`/status/${rowIdx}`)
                  .then(res => res.json())
                  .then(({ status }) => {
                    if (status === "available" || status === userInfo.name) {
                      if (btnVal === "Check-In") {
                        payload = {
                          status: "available",
                          timestamp: currentDateAndTime
                        };
                      } else if (btnVal === "Check-Out") {
                        payload = {
                          status: userInfo.name,
                          timestamp: currentDateAndTime
                        };
                      }
                      // Specify req options based on the current availability status
                      const requestOptions = {
                        method: "PATCH", //Using PATCH call to only update the status property in the db
                        body: JSON.stringify(payload),
                        headers: { "Content-Type": "application/json" }
                      };

                      // Fetch it to the backend API with a new status
                      fetch(`/patchStatus/${rowIdx}`, requestOptions)
                        .then(response => response.json())
                        .then(response => console.log(response));

                      btnVal =
                        btnVal === "Check-Out" ? "Check-In" : "Check-Out";

                      document.getElementById(btnId).value = btnVal;

                      // Update row's 'Status' to either "available" or the currently logged-in username
                      updateMyData(rowIdx, "status", payload.status);

                      // Update the row's 'Timestamp' to the current time
                      updateMyData(rowIdx, "timestamp", currentDateAndTime);
                    } else if (
                      status !== "available" ||
                      status !== userInfo.name
                    ) {
                      btnVal = "n/a";
                    }
                  });
              }}
            >
              {btnVal}
            </Button>
          );
        }
      },
      {
        Header: "Status",
        accessor: "status"
      },
      {
        Header: "TimeStamp",
        accessor: "timestamp"
      },
      {
        Header: "Service Tag",
        accessor: "serviceTag"
      },
      {
        Header: "IP Address",
        accessor: "ip"
      },
      {
        Header: "Host Name",
        accessor: "hostname"
      },
      {
        Header: "Model",
        accessor: "model"
      },
      {
        Header: "Generation",
        accessor: "generation"
      },
      {
        Header: "Comments",
        Cell: EditableCell
      }
    ],
    [userInfo.name]
  );

  const [data, setData] = React.useState([]);
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

  // useEffect(() => {
  //   localStorage.setItem("tableData", data);
  // }, [data]);

  useEffect(() => {
    // setLoading({ done: false });
    fetch("/getServers")
      .then(res => res.json())
      .then(data => {
        setData(
          data.map(item => {
            return item;
          })
        );
        setLoading({ done: true });
      });
    // .then(setLoading({ done: true }));
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
