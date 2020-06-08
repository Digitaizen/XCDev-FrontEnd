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

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  Table,
  Container,
  Row,
  CardFooter,
  Pagination
} from "reactstrap";

import Form from "react-bootstrap/Form";

// core components
import Header from "../../components/Headers/Header.js";

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
      fetch(`/patchComments/${index}`, requestOptions)
        .then(response => response.json())
        .catch(e => {
          console.error(e.message);
        });
      console.log(`Updated row ${index} with new comment: ${value}`); //Leaving here for logging and troubleshooting
    }
  };

  return (
    <input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};

function Tables({ columns, data, updateMyData, loading }) {
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
    state: { pageIndex, pageSize },
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
    setGlobalFilter
  } = useTable(
    {
      columns,
      data,
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

                      // Update row's 'Status' to either "available" or the currently logged-in username
                      updateMyData(rowIdx, "status", payload.status);

                      // Update the row's 'Timestamp' to the current time
                      updateMyData(rowIdx, "timestamp", currentDateAndTime);
                    } else if (
                      status !== "available" ||
                      status !== userInfo.name
                    ) {
                      btnVal = "n/a";
                      console.log("I AM RUNNING");
                      // toggleModal();
                      updateMyData(rowIdx, "Action", btnVal);
                    }

                    // document.getElementById(btnId).value = btnVal;
                    // updateMyData(rowIdx, "action", btnVal);
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
      // {
      //   Header: "Generation",
      //   accessor: "generation",
      //   filter: "fuzzyText"
      // },
      {
        Header: "Comments",
        accessor: "comments",
        Cell: EditableComments,
        disableFilters: true
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

  useEffect(() => {
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
