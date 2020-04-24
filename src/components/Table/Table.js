import React from "react";
import { useTable } from "react-table";

// reactstrap components
import {
  Card,
  CardHeader,
  CardFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table,
  Container,
  Row
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
// import TableRow from "../TableRow/TableRow";

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

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

function TableComponent({ columns, data, updateMyData }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows
  } = useTable({
    columns,
    data,
    updateMyData
  });

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
              <Table bordered {...getTableProps()}>
                <thead>
                  {headerGroups.map(headerGroup => (
                    <tr
                      {...headerGroup.getHeaderGroupProps()}
                      key={headerGroup}
                    >
                      {headerGroup.headers.map(column => {
                        const { render, getHeaderProps } = column;
                        return (
                          <th key={Headers} {...getHeaderProps()}>
                            {render("Header")}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr key={row} {...row.getRowProps()}>
                        {row.cells.map(cell => {
                          return (
                            <td key={cell} {...cell.getCellProps()}>
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
                    <PaginationItem className="disabled">
                      <PaginationLink
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                        tabIndex="-1"
                      >
                        <i className="fas fa-angle-left" />
                        <span className="sr-only">Previous</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem className="active">
                      <PaginationLink
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        2 <span className="sr-only">(current)</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        3
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        <i className="fas fa-angle-right" />
                        <span className="sr-only">Next</span>
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </nav>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

function InventoryTable(props) {
  const [
    {
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
    }
  ] = props.systemInventory;

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
        Header: "Cluster",
        accessor: "cluster"
      },
      {
        Header: "Model",
        accessor: "model"
      },
      {
        Header: "Idrac",
        accessor: "idrac"
      },
      {
        Header: "HV",
        accessor: "hv"
      },
      {
        Header: "CVM",
        accessor: "cvm"
      },
      {
        Header: "Bldg",
        accessor: "building"
      },
      {
        Header: "Rack",
        accessor: "rack"
      },
      {
        Header: "RackU",
        accessor: "rackU"
      },
      {
        Header: "CurrentStatus",
        accessor: "currentStatus"
      },
      {
        Header: "Comment",
        accessor: "comment",
        Cell: EditableCell
      }
    ],
    []
  );

  const temp_data = React.useMemo(
    () => [
      {
        serviceTag: serviceTag, //Fetch call to ur1
        system: system,
        cluster: cluster, //Fetch call from ur2
        model: model,
        idrac: idrac,
        hv: hv,
        cvm: cvm,
        building: building,
        rack: rack,
        rackU: rackU,
        currentStatus: currentStatus,
        comment: comment
      }
    ],
    [
      building,
      cluster,
      comment,
      currentStatus,
      cvm,
      hv,
      idrac,
      model,
      rack,
      rackU,
      serviceTag,
      system
    ]
  );

  const [data, setData] = React.useState(temp_data);
  // const [originalData] = React.useState(data);
  // const [skipPageReset, setSkipPageReset] = React.useState(false);

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    return console.log(rowIndex, columnId, value);

    //   setSkipPageReset(true);
    //   setData(old =>
    //     old.map((row, index) => {
    //       if (index === rowIndex) {
    //         return {
    //           ...old[rowIndex],
    //           [columnId]: value
    //         };
    //       }
    //       return row;
    //     })
    //   );
  };

  return (
    <TableComponent
      columns={columns}
      data={data}
      updateMyData={updateMyData}
      // skipPageReset={skipPageReset}
    />
  );
}

export default InventoryTable;
