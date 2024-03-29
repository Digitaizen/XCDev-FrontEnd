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
import React from "react";
// import HeaderCard from "./HeaderCard";

// reactstrap components
import { Container } from "reactstrap";

// const args = [
//   {
//     id: "1",
//     title: "Total 13G Servers",
//     titleValue: "150",
//     iconColor: "info",
//     icon: "chart-bar",
//     arrowColor: "success",
//     arrow: "up",
//     percent: "3.48%",
//     since: "Since last month"
//   },
//   {
//     id: "2",
//     title: "Total 14G Servers",
//     titleValue: "80",
//     iconColor: "info",
//     icon: "chart-pie",
//     arrowColor: "danger",
//     arrow: "down",
//     percent: "3.48%",
//     since: "Since last week"
//   },
//   {
//     id: "3",
//     title: "Avilable Servers",
//     titleValue: "34",
//     iconColor: "yellow",
//     icon: "server",
//     arrowColor: "warning",
//     arrow: "down",
//     percent: "1.10%",
//     since: "Since yesterday"
//   },
//   {
//     id: "4",
//     title: "Total Usuage",
//     titleValue: "85",
//     iconColor: "info",
//     icon: "percent",
//     arrowColor: "success",
//     arrow: "up",
//     percent: "12%",
//     since: "Since last month"
//   }
// ];

class Header extends React.Component {
  render() {
    return (
      <>
        <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
          <Container fluid>
            <div className="header-body">
              {/* Card stats
              <Row>
                {args.map(arg => {
                  return (
                    <HeaderCard
                      key={arg.id}
                      title={arg.title}
                      titleValue={arg.titleValue}
                      iconColor={arg.iconColor}
                      icon={arg.icon}
                      arrowColor={arg.arrowColor}
                      arrow={arg.arrow}
                      percent={arg.percent}
                      since={arg.since}
                    />
                  );
                })}
              </Row> */}
            </div>
          </Container>
        </div>
      </>
    );
  }
}

export default Header;
