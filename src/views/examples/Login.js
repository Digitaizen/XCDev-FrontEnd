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
import React, { useState, useContext } from "react";
import { Link, Redirect } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { UserInfoContext } from "../../context/UserInfoContext";

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

const Login = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthTokens } = useAuth();
  const { setUserInfo } = useContext(UserInfoContext);
  // const apiServer = "http://100.80.149.19:8080"; // for production build
  const apiServer = process.env.REACT_APP_API_SERVER;
  // const apiServer = ""; // for local dev work

  function postLogin(e) {
    e.preventDefault();
    e.stopPropagation();

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ username: userName, password: password }),
      headers: { "Content-Type": "application/json" }
    };

    // Fetch user-entered login data to backend API for validation
    fetch(`${apiServer}/login`, requestOptions)
      .then(response => response.json())
      .then(response => {
        // If backend API returns an object with 'success' flag then login user
        // otherwise display error message on the login screen
        if (response.success) {
          console.log(response.message); //debugging
          setAuthTokens(response.token);
          setUserInfo(response.userInfo);
          setLoggedIn(true);
        } else {
          console.log(response.message); //debugging
          setErrMessage(response.message);
          setIsError(true);
          setLoggedIn(false);
        }
      });
  }

  // Redirect to main page upon a successful login
  if (isLoggedIn === true) {
    return <Redirect to="/admin/tables" />;
  }

  // Build the Login Form
  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-2">
            <div>
              <h1 className="text-blue text-center">LOG IN</h1>
            </div>
            {/* <div className="text-muted text-center mt-2 mb-3">
                <small>Sign in with</small>
              </div>
              <div className="btn-wrapper text-center">
                <Button
                  className="btn-neutral btn-icon"
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
              <small>Sign in with credentials</small>
            </div>
            <Form role="form">
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Username"
                    type="username"
                    value={userName}
                    onChange={e => {
                      setUserName(e.target.value);
                      setIsError(false); //reset error message upon new value entry
                    }}
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
                      setIsError(false); //reset error message upon new value entry
                    }}
                    placeholder="Password"
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
                  // <small style={{ color: "red" }}>
                  //   The username or password provided were incorrect!
                  // </small>
                )}
              </div>
              {/* <div className="custom-control custom-control-alternative custom-checkbox">
                <input
                  className="custom-control-input"
                  id=" customCheckLogin"
                  type="checkbox"
                />
                <label
                  className="custom-control-label"
                  htmlFor=" customCheckLogin"
                >
                  <span className="text-muted">Remember me</span>
                </label>
              </div> */}
              <div className="text-center">
                <Button
                  className="my-4"
                  color="primary"
                  type="submit"
                  onClick={e => postLogin(e)}
                >
                  Log in
                </Button>
              </div>
              <Link to="/auth/reset">
                <small>Forgot Password? Click here to Reset Password</small>
              </Link>
            </Form>
          </CardBody>
        </Card>

        {/* <Row className="mt-3">
          <Col xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={e => e.preventDefault()}
            >
              <small>Forgot password?</small>
            </a>
          </Col>
          <Col className="text-right" xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={e => e.preventDefault()}
            >
              <small>Create new account</small>
            </a>
          </Col>
        </Row> */}
      </Col>
    </>
  );
};

export default Login;
