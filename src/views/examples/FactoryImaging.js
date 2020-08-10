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
import React, { useState, useEffect } from "react";
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
  Row,
  CardFooter,
  Pagination,
  Input
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
  updateMyData
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  // Set 'initialValue' to value read upon cell focus event
  const onFocus = e => {
    initialValue = e.target.value;
    // set height of textarea to display the full comment
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // Set table cell's value upon input
  const onChange = e => {
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
          Accept: "application/json"
        }
      };

      // Now fetch it to the backend API
      fetch(`${apiServer}/patchComments/${row.original._id}`, requestOptions)
        .then(response => response.json())
        .catch(e => {
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
          overflow: "hidden"
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
const IP_Hyperlink = props => {
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

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

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
    selectedFlatRows,
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
    state: { pageIndex, pageSize, selectedRowIds }
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
    usePagination,
    hooks => {
      hooks.visibleColumns.push(columns => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          )
        },
        ...columns
      ]);
    }
  );

  const selectedRowData = selectedFlatRows.map(d => d.original);

  // eslint-disable-next-line no-console
  console.log(selectedRowData.map(d => d.ip));

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
                <h3 className="mb-0">Factory Imaging</h3>
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
                      {page.map(row => {
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
                  {/* Placeholder Code START - to show the selected Row ID and the Row Data in an Array */}
                  <p>Selected Rows: {Object.keys(selectedRowIds).length}</p>
                  <pre>
                    <code>
                      {JSON.stringify(
                        {
                          selectedRowIds: selectedRowIds,
                          "selectedFlatRows[].original": selectedFlatRows.map(
                            d => d.original
                          )
                        },
                        null,
                        2
                      )}
                    </code>
                  </pre>
                  {/* Placeholder Code END - to show the selected Row ID and the Row Data in an Array */}
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

function FactoryImaging() {
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
        Header: "Service Tag",
        accessor: "serviceTag"
      },
      {
        Header: "System",
        accessor: "system"
      },
      {
        Header: "IP Address",
        accessor: "ip",
        Cell: IP_Hyperlink
      },
      {
        Header: "Model",
        accessor: "model"
      },
      {
        Header: "Location",
        accessor: "location"
      },
      {
        Header: "Status",
        accessor: "status"
      },
      {
        Header: "Comments",
        accessor: "comments",
        Cell: EditableComments,
        disableFilters: true
      }
    ],
    []
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
    fetch(`${apiServer}/getUserServers/${userInfo.name}`)
      .then(res => res.json())
      .then(data => {
        setData(
          data.results.map(item => {
            return item;
          })
        );
        setLoading({ done: true });
      });
  }, [userInfo.name]);

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

export default FactoryImaging;
