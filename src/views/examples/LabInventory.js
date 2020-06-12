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
import {
  useTable,
  useRowSelect,
  useSortBy,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  usePagination
} from "react-table";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import * as dotLoading from "../../components/Loading/dotLoading.json";
import { UserInfoContext } from "../../context/UserInfoContext";
import matchSorter from "match-sorter";
import PropTypes from "prop-types";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  Table,
  Container,
  Row,
  CardFooter,
  Pagination,
  Modal
} from "reactstrap";

import Form from "react-bootstrap/Form";

// core components
import Header from "../../components/Headers/Header.js";
const apiServer = "http://100.80.149.19:8080";

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      Search:{" "}
      <input
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
          border: "0"
        }}
      />
    </span>
  );
}

// Define a default filtering method
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter }
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val;

// Make comments section editable field
const EditableComments = ({ value: initialValue, row: { index } }) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  // Set 'initialValue' to value read upon cell focus event
  const onFocus = e => {
    initialValue = e.target.value;
  };

  // Set table cell's value upon input
  const onChange = e => {
    setValue(e.target.value);
  };

  //Write new comment string to database upon user leaving the table cell entry
  const onBlur = () => {
    if (value === initialValue) {
      return;
    } else {
      // Specify request options
      const requestOptions = {
        method: "PATCH",
        body: JSON.stringify({ comments: value }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      };

      // Now fetch it to the backend API
      fetch(`${apiServer}/patchComments/${index}`, requestOptions)
        .then(response => response.json())
        .catch(e => {
          console.error(e.message);
        });
      console.log(`Updated row ${index} with new comment: ${value}`); //Leaving here for logging and troubleshooting
    }
  };

  return (
    <div>
      <input
        // display="inline"
        // type="text"
        // size=""
        // width="100%"
        // height="100%"
        style={{
          border: "none",
          margin: "0",
          padding: "0",
          width: "100%",
          height: "100%"
        }}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </div>
  );
};

function Tables({ columns, data, updateMyData, loading, skipPageResetRef }) {
  //Dropdown Menu State
  // const [dropdownOpen, setDropdownOpen] = useState(false);
  // const toggle = () => setDropdownOpen(prevState => !prevState);

  //default options defined for the lottie file loading animation
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: dotLoading.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  //Fuzzy text filtering
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      }
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter
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
    state: { pageIndex, pageSize }
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
      filterTypes
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    usePagination
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
                <React.Fragment>
                  <Table
                    className="align-items-center"
                    bordered
                    hover
                    responsive
                    {...getTableProps()}
                  >
                    <thead>
                      {headerGroups.map(headerGroup => (
                        <tr
                          key={headerGroup.id}
                          {...headerGroup.getHeaderGroupProps()}
                        >
                          {headerGroup.headers.map(column => (
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
                            textAlign: "left"
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
                      {page.map((row, i) => {
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
                          onChange={e => {
                            setPageSize(Number(e.target.value));
                          }}
                          onBlur={e => {
                            setPageSize(Number(e.target.value));
                          }}
                        >
                          {[10, 20, 30, 40, 50].map(pageSize => (
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

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter(row => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = val => typeof val !== "number";

function LabInventory() {
  const { userInfo } = useContext(UserInfoContext);
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
        Cell: props => {
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
              style={{
                minWidth: 118, // set button's width so they are uniform in size
                minHeight: 30,
                backgroundColor: btnBkgdColor
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

                console.log("onClick btnVal: ", btnVal); //debugging

                // Set action logic based on button's Action value
                if (btnVal === "Check-Out") {
                  // Run db check to see if this server is still available
                  fetch(`${apiServer}/status/${dbRowIdx}`)
                    .then(res => res.json())
                    .then(({ status, serviceTag }) => {
                      checkStatus = status;

                      console.log("Check status: ", checkStatus); //debugging

                      // Based on the db check above either check-out the server into user's name or
                      // notify the user that it has already been checked-out
                      if (checkStatus === "available") {
                        // Set the payload with user's name and current timestamp
                        payload = {
                          status: userInfo.name,
                          timestamp: currentDateAndTime
                        };
                        // Specify req options based on the current availability status
                        const requestOptions = {
                          method: "PATCH",
                          body: JSON.stringify(payload),
                          headers: { "Content-Type": "application/json" }
                        };

                        console.log(
                          "Checking-out ",
                          serviceTag,
                          " out of db with these values: ",
                          payload.status,
                          " and ",
                          payload.timestamp,
                          " for dbRowIdx ",
                          dbRowIdx,
                          " and tblRowIdx ",
                          tblRowIdx
                        ); //debugging

                        // Fetch it to the backend API with a new status
                        fetch(
                          `${apiServer}/patchStatus/${dbRowIdx}`,
                          requestOptions
                        )
                          .then(response => response.json())
                          .then(response => console.log(response));

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
                        console.log(
                          "Sorry, the server ",
                          rowTag,
                          " has already been checked-out by: ",
                          checkStatus
                        ); //debugging
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
                    timestamp: currentDateAndTime
                  };
                  // Specify req options based on the current availability status
                  const requestOptions = {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                    headers: { "Content-Type": "application/json" }
                  };

                  console.log(
                    "Checking-in ",
                    rowTag,
                    " into db with these values: ",
                    payload.status,
                    " and ",
                    payload.timestamp,
                    " for dbRowIdx ",
                    dbRowIdx,
                    " and tblRowIdx ",
                    tblRowIdx
                  ); //debugging

                  // Fetch it to the backend API with a new status
                  fetch(`${apiServer}/patchStatus/${dbRowIdx}`, requestOptions)
                    .then(response => response.json())
                    .then(response => console.log(response));

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
        }
      },
      {
        Header: "Status",
        accessor: "status",
        filter: "fuzzyText"
      },
      {
        Header: "TimeStamp",
        accessor: "timestamp",
        sortType: "basic",
        filter: "fuzzyText"
      },
      {
        Header: "Service Tag",
        accessor: "serviceTag",
        filter: "fuzzyText"
      },
      {
        Header: "IP Address",
        accessor: "ip",
        filter: "fuzzyText"
      },
      {
        Header: "Host Name",
        accessor: "hostname",
        filter: "fuzzyText"
      },
      {
        Header: "Model",
        accessor: "model",
        filter: "fuzzyText"
      },
      {
        Header: "Generation",
        accessor: "generation",
        filter: "fuzzyText"
      },
      {
        Header: "Comments",
        accessor: "comments",
        Cell: EditableComments,
        disableFilters: true
      }
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

  // After data changes, we turn the flag back off
  // so that if data actually changes when we're not
  // editing it, the page is reset
  React.useEffect(() => {
    // After the table has updated, always remove the flag
    skipPageResetRef.current = false;
  });

  useEffect(() => {
    fetch(`${apiServer}/getServers`)
      .then(res => res.json())
      .then(data => {
        setData(
          data.map(item => {
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

export default LabInventory;
