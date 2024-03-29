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
  usePagination,
} from "react-table";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import * as dotLoading from "../../components/Loading/dotLoading.json";
import matchSorter from "match-sorter";
import Select from "react-select";
import axios from "axios";
// reactstrap components
import {
  UncontrolledAlert,
  Button,
  Card,
  CardHeader,
  Table,
  Container,
  Col,
  Row,
  CardFooter,
  Pagination,
  Input,
  Label,
} from "reactstrap";
import Form from "react-bootstrap/Form";
import Modal from 'react-bootstrap/Modal';
// core components
import Header from "../../components/Headers/Header.js";

const apiServer = process.env.REACT_APP_API_SERVER;

function MydModalWithGrid(props) {

  function handleConfirm() {
    props.handleClick()
    props.onHide()
  }
  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" backdrop="static" keyboard={false} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          CONFIRMATION
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <Container>
          <Row>
            <Col md={12}>
              Are you sure you want to perform factory image process on the following servers?
              <br />
              {props.selectedRowData.map((item) => (
                <li key={item.serviceTag}>{item.ip}</li>
              ))}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleConfirm}>Confirm</Button>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      Search:{" "}
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
          border: "0",
        }}
      />
    </span>
  );
}

// Define a default filtering method
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

// Function to resize a textarea box to match its content size
function ResizeTextArea(id) {
  let taHeight = "";
  taHeight = document.getElementById(id).scrollHeight;
  document.getElementById(id).style.height = taHeight + "px";
}

// Fetch server data from db and add it to state
function fetchServers(tagArr) {
  return new Promise((resolve, reject) => {
    console.log(`'fetchServers' from db function called.`); //debugging

    // Fetch these Service Tags to a db query
    // Specify request options
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ ServiceTagArr: tagArr }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    fetch(`${apiServer}/getServersByTag`, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        console.log(`Catch in fetchServers on fetch: ${e.statusText}`);
        reject([]);
      });
  });
}

// function startBmrStatusUpdates() {  
// }

// Self-updating component for BMR Status field of the table
const BmrStatusUpdate = ({row}) => {
  let initialValue = row.original.bmrStatus;
  let nodeServiceTag = row.original.serviceTag;
  const [value, setValue] = useState(initialValue);  

  // First check the initial value upon table load
  if (initialValue === "BMR complete") {
    console.log(`BMR finished on ${nodeServiceTag}. No further checks necessary.`);
  } else if (initialValue === "") {
    console.log(`No BMR-in-process on ${nodeServiceTag}. No further checks necessary.`);
  } else {
    // Call database in a loop to read current bmrStatus value
    console.log(`Starting BMR update for ${nodeServiceTag}`); //debugging
    let checkInterval = setInterval(() => {
      fetchServers([nodeServiceTag])
      .then((data) => {
        console.log(`DB check for BMR Status on ${nodeServiceTag}: "${data[0].bmrStatus}"`); //debugging        
        // If BMR has finished then stop the loop
        if (data[0].bmrStatus === "BMR complete") {
          console.log(`Stopping BMR update for ${nodeServiceTag}`); //debugging
          clearInterval(checkInterval);
        } 
        setValue(data[0].bmrStatus);
      })
      .catch((error) => {
        console.log(`CATCH on fetchServers call in BMR cell update: ${error.statusText}`);
      })
    }, 10000);
  }  

  return (
    <div>
      <Input 
        type="text"
        value={value}
        readonly
        style={{
          border: "none",
          background: "none"
        }}
      />
    </div>
  );
}

// Make comments section editable field
const EditableComments = ({
  value: initialValue,
  row,
  column: { id },
  updateMyData,
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  // Set 'initialValue' to value read upon cell focus event
  const onFocus = (e) => {
    initialValue = e.target.value;
    // set height of textarea to display the full comment
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // Set table cell's value upon input
  const onChange = (e) => {
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
          Accept: "application/json",
        },
      };

      // Now fetch it to the backend API
      fetch(`${apiServer}/patchComments/${row.original._id}`, requestOptions)
        .then((response) => response.json())
        .catch((e) => {
          // eslint-disable-next-line no-console
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
          overflow: "hidden",
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
const IP_Hyperlink = (props) => {
  let iDRAC_IP = props.cell.row.original.ip;
  let iDRAC_link = "http://" + iDRAC_IP;
  return (
    <div>
      <a target="_blank" href={iDRAC_link} rel="noopener noreferrer">
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
  const [bmrOptions, setBmrOptions] = useState([]);
  const [factoryblockOptions, setFactoryblockOptions] = useState([]);
  const [hypervisorOptions, setHypervisorOptions] = useState([]);
  const [selectedBmrIsoOption, setSelectedBmrIsoOption] = useState("");
  const [selectedFactoryBlockOption, setSelectedFactoryBlockOption] = useState("");
  const [selectedHypervisorOption, setSelectedHypervisorOption] = useState("");
  const [modalShow, setModalShow] = useState(false);

  // API request for getting Factory Block Folder List
  useEffect(() => {
    let config = {
      method: "get",
      // url: "http://localhost:8080/getIsoFiles",
      url: "http://100.80.149.97:8080/getFactoryBlock",
      // url: `${apiServer}/getFactoryBlock`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data.results));
        setFactoryblockOptions(response.data.results);
      })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
  }, []);

  // API request for getting BMR ISO File List
  useEffect(() => {
    let config = {
      method: "get",
      // url: "http://localhost:8080/getIsoFiles",
      url: "http://100.80.149.97:8080/getBmrIso",
      // url: `${apiServer}/getBmrIso`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data.results));
        setBmrOptions(response.data.results);
      })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
  }, []);

  // API request for getting Hypervisor List
  useEffect(() => {
    let config = {
      method: "get",
      url: "http://100.80.149.97:8080/getHypervisors",
      // url: `${apiServer}/getHypervisors`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        setHypervisorOptions(response.data.results);
      })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
  }, []);

  //default options defined for the lottie file loading animation
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: dotLoading.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  //Fuzzy text filtering
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
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
    state: { pageIndex, pageSize, selectedRowIds },
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
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
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
          ),
        },
        ...columns,
      ]);
    }
  );

  const selectedRowData = selectedFlatRows.map((d) => d.original);

  useEffect(() => {
    if (selectedRowData.length === 0) {
      setSelectedBmrIsoOption("")
    }
  }, [selectedRowData.length])



  // eslint-disable-next-line no-console
  // console.log(selectedRowData.map(d => d.ip));

  // // Selecting the value from the react-select Selection Dropdown
  // const handleChange = (selectedOption) => {
  //   setSelectedIsoOption(selectedOption.value);
  //   // eslint-disable-next-line no-console
  //   // console.log(`Option selected:`, selectedOption.value);
  // };

  const handleClick = () => {
    // eslint-disable-next-line no-console
    console.log({
      selectedBmrIsoOption,
      selectedFactoryBlockOption,
      selectedHypervisorOption,
      selectedRowData,
    });

    async function makePostRequest() {
      let params = {
        selectedBmrIsoOption: selectedBmrIsoOption,
        selectedFactoryBlockOption: selectedFactoryBlockOption,
        selectedHypervisorOption: selectedHypervisorOption,
        selectedRowData: selectedRowData,
      };

      let res = await axios.post(
        "http://100.80.149.97:8080/bmrFactoryImaging",
        // `${apiServer}/bmrFactoryImaging`,
        params
      );

      console.log(res.data);
    }

    makePostRequest();
    // startBmrStatusUpdates();
  };

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
                    <Row>
                      <Col md="12">
                        <UncontrolledAlert className="alert-default" fade={false}>
                          <span className="alert-inner--icon">
                            <i className="ni ni-air-baloon" />
                          </span>{" "}
                          <span className="alert-inner--text">
                            <strong>INFO!</strong> Only iDRAC version 4.00.00.00
                          systems and higher are supported for Factory Imaging
                          Automation
                        </span>
                        </UncontrolledAlert>
                      </Col>
                    </Row>
                    {selectedRowData.length !== 0 ? (
                      <div>
                        <Row>
                          <Col md="4">
                            <Select
                              className="mt-2 col-md-12 col-offset-4"
                              placeholder="Select BMR ISO File..."
                              options={bmrOptions}
                              onChange={(selectedOption) =>
                                setSelectedBmrIsoOption(selectedOption.value)
                              }
                            />
                          </Col>
                          <Col md="4">
                            <Select
                              className="mt-2 col-md-12 col-offset-4"
                              placeholder="Select Factory Block..."
                              options={factoryblockOptions}
                              onChange={(selectedOption) =>
                                setSelectedFactoryBlockOption(
                                  selectedOption.value
                                )
                              }
                            />
                          </Col>
                          <Col md="4">
                            <Select
                              className="mt-2 col-md-12 col-offset-4"
                              placeholder="Select Hypervisor..."
                              options={hypervisorOptions}
                              onChange={(selectedOption) =>
                                setSelectedHypervisorOption(selectedOption.value)
                              }
                            />
                          </Col>
                        </Row>
                      &nbsp;
                        <Row>
                          <Col md="4">
                            <Button
                              color="primary"
                              style={{ "margin-left": "15px" }}
                              // onClick={handleClick}
                              onClick={() => setModalShow(true)}
                              disabled={selectedBmrIsoOption === "" || selectedFactoryBlockOption === "" || selectedHypervisorOption === "" ? true : false}
                            >
                              Start Imaging
                          </Button>{" "}
                          </Col>
                        </Row>
                      </div>
                    ) : null}
                    <MydModalWithGrid show={modalShow} onHide={() => setModalShow(false)} handleClick={handleClick} selectedRowData={selectedRowData} />
                    <br />
                    <Table
                      className="align-items-center"
                      bordered
                      hover
                      responsive
                      size="sm"
                      {...getTableProps()}
                    >
                      <thead>
                        {headerGroups.map((headerGroup) => (
                          <tr
                            key={headerGroup.id}
                            {...headerGroup.getHeaderGroupProps()}
                          >
                            {headerGroup.headers.map((column) => (
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
                              textAlign: "left",
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
                        {page.map((row) => {
                          prepareRow(row);
                          return (
                            <tr key={row.id} id={row.id} {...row.getRowProps()}>
                              {row.cells.map((cell) => {
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
                    {/* <p>Selected Rows: {Object.keys(selectedRowIds).length}</p>
                    <pre>
                      <code>
                        {JSON.stringify(
                          {
                            selectedRowIds: selectedRowIds,
                            "selectedFlatRows[].original": selectedFlatRows.map(
                              (d) => d.original
                            ),
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre> */}
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
                            onChange={(e) => {
                              setPageSize(Number(e.target.value));
                            }}
                            onBlur={(e) => {
                              setPageSize(Number(e.target.value));
                            }}
                          >
                            {[10, 20, 30, 40, 50].map((pageSize) => (
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
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== "number";

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
        accessor: "serviceTag",
      },
      {
        Header: "System",
        accessor: "system",
      },
      {
        Header: "IP Address",
        accessor: "ip",
        Cell: IP_Hyperlink,
      },
      {
        Header: "Model",
        accessor: "model",
      },
      // {
      //   Header: "Location",
      //   accessor: "location",
      // },
      // {
      //   Header: "Status",
      //   accessor: "status",
      // },
      // {
      //   Header: "Comments",
      //   accessor: "comments",
      //   Cell: EditableComments,
      //   disableFilters: true,
      // },
      {
        Header: "BMR Status",
        accessor: "bmrStatus",
        Cell: BmrStatusUpdate
      },
      {
        Header: "BMR Started",
        accessor: "bmrStarted",
      },
      {
        Header: "BMR Finished",
        accessor: "bmrFinished"
      },
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
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
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
      .then((res) => res.json())
      .then((data) => {
        setData(
          data.results.map((item) => {
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
