import React from "react";
// reactstrap components
import { Card, CardBody, CardTitle, Row, Col } from "reactstrap";

const HeaderCard = props => {
  return (
    <Col lg="6" xl="3">
      <Card className="card-stats mb-4 mb-xl-0">
        <CardBody>
          <Row>
            <div className="col">
              <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                {props.title}
              </CardTitle>
              <span className="h2 font-weight-bold mb-0">
                {props.titleValue}
              </span>
            </div>
            <Col className="col-auto">
              <div
                className={`icon icon-shape bg-${props.iconColor} text-white rounded-circle shadow`}
              >
                <i className={`fas fa-${props.icon}`} />
              </div>
            </Col>
          </Row>
          <p className="mt-3 mb-0 text-muted text-sm">
            <span className={`text-${props.arrowColor} mr-2`}>
              <i className={`fas fa-arrow-${props.arrow}`} /> {props.percent}
            </span>{" "}
            <span className="text-nowrap">{props.since}</span>
          </p>
        </CardBody>
      </Card>
    </Col>
  );
};

export default HeaderCard;
