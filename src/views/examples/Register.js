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
  Col
} from "reactstrap";

const Register = () => {
  const [registered, setRegistered] = useState(false);
  const [isError, setIsError] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthTokens } = useAuth();

  function handleChange(e) {
    let value = e.target.value;
    setEmail(e.target.value);
    let username = value.substring(0, value.lastIndexOf("@"));
    setUserName(username);
  }

  function postRegister() {
    if (userName === "" || password === "") {
      setIsError(true);
      setRegistered(false);
    } else {
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

      fetch(`/register`, requestOptions)
        .then(response => response.json())
        .then(response => {
          console.log(response);
          setAuthTokens(response.token);
          setRegistered(true);
          // setIsError(false);
        });
    }
  }

  // function handleEmail(e) {
  //   let email = e.target.value;
  //   setEmail(email);
  //   setUserName(email.substring(0, email.lastIndexOf("@")));
  // }

  if (registered === true) {
    return <Redirect to="/auth/login" />;
  }

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
                  onClick={postRegister}
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
            {isError && (
              <small style={{ color: "red" }}>
                An Error has occurred, please try again!
              </small>
            )}
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default Register;
