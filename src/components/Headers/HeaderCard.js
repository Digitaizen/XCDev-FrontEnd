import React from "react";
// reactstrap components
import { Card, CardBody, CardTitle, Row, Col } from "reactstrap";

const HeaderCard = ({ args }) => {
    return (
        <Col lg="6" xl="3">
            <Card className="card-stats mb-4 mb-xl-0">
            <CardBody>
                <Row>
                <div className="col">
                    <CardTitle
                    tag="h5"
                    className="text-uppercase text-muted mb-0"
                    >
                    {args.title}
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0">
                    {args.titleValue}
                    </span>
                </div>
                <Col className="col-auto">
                    <div className={`icon icon-shape bg-${args.iconColor} text-white rounded-circle shadow`}>
                    <i className={`fas fa-${args.icon}`} />
                    </div>
                </Col>
                </Row>
                <p className="mt-3 mb-0 text-muted text-sm">
                <span className={`text-${args.arrowColor} mr-2`}>
                    <i className={`fas fa-arrow-${args.arrow}`} /> {args.percent}
                </span>{" "}
                <span className="text-nowrap">{args.since}</span>
                </p>
            </CardBody>
            </Card>
        </Col>
    );
};

export default HeaderCard;