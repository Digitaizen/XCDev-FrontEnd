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
import { doc, format } from "prettier";

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

// const CheckButton = row => {
//   const [checkButton, setcheckButton] = useState("check-OUT");
//   const [initialLoadState, setInitialLoadState] = useState(false);
//   const [disabled, setDisabled] = useState(false);
//   const { userInfo } = useContext(UserInfoContext);

//   // // Updating the status property of the checkButton on external database
//   // useEffect(() => {
//   //   if (initialLoadState === true) {
//   //     const requestOptions = {
//   //       method: "PATCH", //Using PATCH call to only update the status property in the db
//   //       body: JSON.stringify({ status: checkButton.value }),
//   //       headers: { "Content-Type": "application/json" }
//   //     };

//   //     fetch(`/patchStatus/${row.id}`, requestOptions)
//   //       .then(response => response.json())
//   //       .then(response => console.log(response));

//   //     console.log("update fetch RowId:", row.id);
//   //     console.log("New Value:", checkButton.value);
//   //   } else {
//   //     return;
//   //   }
//   // }, [checkButton.value, initialLoadState, row.id]);

//   // //onClick function to switch the checkButton property
//   // const handleClick = () => {
//   //   setInitialLoadState(true);
//   //   setcheckButton(prev => ({
//   //     value: prev.value === "CheckOut" ? "CheckIn" : "CheckOut"
//   //   }));

//   //   console.log("Old Value:", checkButton.value);
//   // };

//   //Fetching checkButton data from the database, CheckIn or CheckOut
//   useEffect(() => {
//     fetch(`/status/${row.id}`)
//       .then(res => res.json())
//       .then(({ status }) => {
//         console.log("Status: ", status);
//         if (status === "Available") {
//           setcheckButton("check-OUT");
//         } else if (status === "Unavailable") {
//           setDisabled(true);
//         } else {
//           if (status === userInfo.username) {
//             setcheckButton("check-IN");
//           } else {
//             setDisabled(true);
//           }
//         };
//       }
//       );
//   }, [row]);

//   // onClick function to switch the checkButton property
//   const handleClick = () => {
//     // Set button value and the patch req payload
//     let payload;
//     if (checkButton.value === "check-IN") {
//       payload = { status: "Available" };
//       setcheckButton("check-OUT");
//     } else {
//       payload = { status: userInfo.username };
//       setcheckButton("check-IN");
//     }
//     // Specify req options based on the current availability status
//     const requestOptions = {
//       method: "PATCH", //Using PATCH call to only update the status property in the db
//       body: JSON.stringify(payload),
//       headers: { "Content-Type": "application/json" }
//     };

//     // Fetch it to the backend API with a new status 
//     fetch(`/patchStatus/${row.id}`, requestOptions)
//       .then(response => response.json())
//       .then(response => console.log(response));

//     console.log(`Updated db with new status: ${payload}`);

//     // Finally, set the appropriate new value for the button
//     setcheckButton(prev => ({
//       value: prev.value === "check-OUT" ? "check-IN" : "check-OUT"
//     }));
//   };

//   return (
//     <>
//       <Button
//         key={row.id}
//         id={row.id}
//         onClick={handleClick}
//         value={checkButton.value}
//         style={{
//           backgroundColor:
//             checkButton.value === "check-OUT" ? "lightgreen" : "#fb6340"
//         }}
//       >
//         {checkButton.value}
//       </Button>
//       {/* <pre>
//         <code>{JSON.stringify(checkButton, null, 2)}</code>
//       </pre> */}
//     </>
//   );
// };

// const TimeStamp = () => {
//   // get a new date (locale machine date time)
//   var date = new Date();
//   // get the date as a string
//   var n = date.toDateString();
//   // get the time as a string
//   var time = date.toLocaleTimeString();
//   return <div>{`${n} ${time}`}</div>;
// };

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
    useRowSelect,
    // hooks => {
    //   hooks.visibleColumns.push(columns => [
    //     {
    //       id: "selection",
    //       Header: () => <div>Action</div>,
    //       Cell: ({ row }) => <CheckButton {...row} />
    //     },
    //     // {
    //     //   id: "status",
    //     //   Header: () => <div>Status</div>,
    //     //   Cell: ({ row }) => <User {...row} />
    //     // },
    //     // {
    //     //   id: "timeStamp",
    //     //   Header: () => <div>Time Stamp</div>,
    //     //   Cell: ({ row }) => <TimeStamp {...row} />
    //     // },
    //     ...columns
    //   ]);
    // }
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
  const { userInfo } = useContext(UserInfoContext);
  const columns = React.useMemo(
    () => [
      {
        Header: "Action",
        Cell: props => {
          // return (<CheckButton {...props} />)
          let rowIdx = props.cell.row.original._id;
          let rowStatus = props.cell.row.original.status;
          let btnId = "btn" + rowIdx;
          let btnVal = "";
          let btnBkgdColor = "white";
          let btnColor = "white";
          let btnDisabled = false;

          console.log("Props row id: ", rowIdx, " and status: ", rowStatus); //for debugging

          if (rowStatus === "available") {
            btnVal = "check-OUT";
            btnBkgdColor = "#5e72e4";
            btnColor = "white";
            btnDisabled = false;
          } else if (rowStatus === userInfo.username) {
            btnVal = "check-IN"
            btnBkgdColor = "#fb6340";
            btnColor = "white";
            btnDisabled = false;
          } else if (rowStatus !== userInfo.username) {
            btnVal = "n/a"
            btnBkgdColor = "lightgray";
            btnColor = "white";
            btnDisabled = true;
          }

          console.log("Username logged-in: ", userInfo.username); //for debugging
          console.log("Value of newly set btn text: ", btnVal, " and Disabled status: ", btnDisabled); //for debugging

          return (<input type="button" style={{ minWidth: 100, minHeight: 30, backgroundColor: btnBkgdColor, color: btnColor, borderRadius: ".25rem", border: "none", fontSize: "14px", fontWeight: "bolder", fontFamily: ("Consolas", "Menlo", "Monaco", "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", "Courier", "monospace") }} id={btnId} value={btnVal}
            onClick={() => {
              // Get current timestamp
              let currentDateAndTime = new Date().toLocaleString();

              // Set payload for PATCH req to db
              let payload;
              if (btnVal === "check-IN") {
                payload = { status: "available", timestamp: currentDateAndTime };
              } else if (btnVal === "check-OUT") {
                payload = { status: userInfo.username, timestamp: currentDateAndTime };
              } else {
                return;
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

              console.log(`Updated db with the new status: ${payload.status}`); //for debugging

              console.log("Old btn value: ", btnVal, " and old btn bkgd color: ", btnBkgdColor); //for debugging

              // Set appropriate button props upon change
              btnVal = (btnVal === "check-OUT") ? "check-IN" : "check-OUT";
              btnBkgdColor = (btnBkgdColor === "#5e72e4") ? "#fb6340" : "#5e72e4";

              console.log("New btn value: ", btnVal, " and new btn bkgd color: ", btnBkgdColor); //for debugging

              document.getElementById(btnId).value = btnVal;
              document.getElementById(btnId).style.backgroundColor = btnBkgdColor;
              console.log(document.getElementById(rowIdx).innerHTML); //for debugging

              // Update row's 'Status' to either "available" or the currently logged-in username
              updateMyData(rowIdx, "status", payload.status);

              // Update the row's 'Timestamp' to the current time
              updateMyData(rowIdx, "timestamp", currentDateAndTime)
            }} />)
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
    []
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

  // React.useEffect(() => {
  //   localStorage.setItem("tableData", data);
  // }, [data]);

  React.useEffect(() => {
    // setLoading({ done: false });
    fetch("/getServers")
      .then(res => res.json())
      .then(data => {
        setData(
          data.map(item => {
            // return {
            //   idracIp: item.ip,
            //   serviceTag: item.data.System.SKU,
            //   model: item.data.System.Model,
            //   hostName: item.data.System.HostName
            // };
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
