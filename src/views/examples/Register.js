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
import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useAuth } from "../../context/auth";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
  UncontrolledAlert
} from "reactstrap";

const Register = () => {
  const [registered, setRegistered] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthTokens } = useAuth();
  // const apiServer = "http://100.80.149.19:8080"; // for production build
  const apiServer = process.env.REACT_APP_API_SERVER;
  // const apiServer = ""; // for local dev work

  function handleChange(e) {
    let value = e.target.value;
    setEmail(e.target.value);
    let username = value.substring(0, value.lastIndexOf("@"));
    setUserName(username);
  }

  function postRegister(e) {
    e.preventDefault();
    e.stopPropagation();

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        username: userName,
        email: email,
        password: password,
        name: name
      }),
      headers: { "Content-Type": "application/json" }
    };

    // Fetch user-entered login data to backend API for validation
    fetch(`${apiServer}/register`, requestOptions)
      .then(response => response.json())
      .then(response => {
        // If backend API returns an object with 'success' flag then login user
        // otherwise display error message on the login screen
        if (response.success) {
          setAuthTokens(response.token);
          setRegistered(true);
        } else {
          setErrMessage(response.message);
          setIsError(true);
          setRegistered(false);
        }
      });
  }

  // Redirect to login page upon a successful registration
  if (registered === true) {
    return <Redirect to="/auth/login" />;
  }

  // Build the Registration Form
  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-2">
            <div>
              <h1 className="text-blue text-center">REGISTER</h1>
            </div>
            {/*
              <div className="text-center">
                <Button
                  className="btn-neutral btn-icon mr-4"
                  color="default"
                  href="#pablo"
                  onClick={e => e.preventDefault()}
                >
                  <span className="btn-inner--icon">
                    <img
                      alt="..."
                      src={require("assets/img/icons/common/github.svg")}
                    />
                  </span>
                  <span className="btn-inner--text">Github</span>
                </Button>
                <Button
                  className="btn-neutral btn-icon"
                  color="default"
                  href="#pablo"
                  onClick={e => e.preventDefault()}
                >
                  <span className="btn-inner--icon">
                    <img
                      alt="..."
                      src={require("assets/img/icons/common/google.svg")}
                    />
                  </span>
                  <span className="btn-inner--text">Google</span>
                </Button>
  </div> */}
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>Please input the following fields below!</small>
            </div>
            <Form role="form">
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="text"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                    }}
                    placeholder="Full Name"
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => handleChange(e)}
                    placeholder="DELL Email Address"
                    // onBlur={e => handleBlur(e)}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="username"
                    value={userName}
                    // defaultValue={email.substring(0, email.lastIndexOf("@"))}
                    // onChange={e => {
                    //   setUserName(e.target.value);
                    // }}
                    // placeholder="Username"
                    readOnly="readonly"
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                    }}
                    placeholder="Password - minimum 6 characters"
                  />
                </InputGroup>
              </FormGroup>
              <div className="text-center text-muted mb-4">
                {isError && (
                  <UncontrolledAlert color="danger" fade={false}>
                    <span className="alert-inner--text">
                      <strong>Error: </strong>
                      {errMessage}
                    </span>
                  </UncontrolledAlert>
                )}
              </div>
              {/* <div className="text-muted font-italic">
                  <small>
                    password strength:{" "}
                    <span className="text-success font-weight-700">strong</span>
                  </small>
                </div> */}
              {/* <Row className="my-4">
                  <Col xs="12">
                    <div className="custom-control custom-control-alternative custom-checkbox">
                      <input
                        className="custom-control-input"
                        id="customCheckRegister"
                        type="checkbox"
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheckRegister"
                      >
                        <span className="text-muted">
                          I agree with the{" "}
                          <a href="#pablo" onClick={e => e.preventDefault()}>
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                    </div>
                  </Col>
                </Row> */}
              <div className="text-center">
                <Button
                  onClick={e => postRegister(e)}
                  className="mt-4"
                  color="primary"
                  type="button"
                >
                  Create account
                </Button>
              </div>
              <hr />
              <Link to="/auth/login">
                <small>Already have an account? Log In</small>
              </Link>
            </Form>
            {/* {isError && (
              <small style={{ color: "red" }}>
                An Error has occurred, please try again! {errMessage}
              </small>
            )} */}
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default Register;
