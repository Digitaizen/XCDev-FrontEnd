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
import { Link } from "react-router-dom";
import {
  AvForm,
  AvField,
  AvGroup,
  AvInput,
  AvFeedback,
  AvRadioGroup,
  AvRadio,
  AvCheckboxGroup,
  AvCheckbox
} from "availity-reactstrap-validation";

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

const Reset = () => {
  const [isError, setIsError] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  // const apiServer = "http://100.80.149.19:8080"; // for production build
  const apiServer = process.env.REACT_APP_API_SERVER;
  // const apiServer = ""; // for local dev work

  useEffect(() => {
    let interval = null;
    if (isReset === true) {
      //   setIsReset(false);
      interval = setInterval(() => {
        // Redirect to another page
        window.location.href = "/login";
      }, 2000);
    }
    return () => (interval ? clearInterval(interval) : null);
  }, [isReset]);

  function postReset(e) {
    e.preventDefault();
    e.stopPropagation();

    if (password !== password2) {
      setPassword("");
      setPassword2("");
      setIsError(true);
      setErrMessage("Password does not match! Please try again!");
    } else {
      const requestOptions = {
        method: "POST",
        body: JSON.stringify({
          username: userName,
          password: password,
          password2: password2
        }),
        headers: { "Content-Type": "application/json" }
      };

      // Fetch user-entered login data to backend API for validation
      fetch(`${apiServer}/reset`, requestOptions)
        .then(response => response.json())
        .then(response => {
          // If backend API returns an object with 'success' flag then login user
          // otherwise display error message on the login screen
          if (response.success) {
            setIsReset(true);
            setSuccessMessage("Password Successfully Reset!");
            setUserName("");
            setPassword("");
            setPassword2("");
          } else {
            setErrMessage(response.message);
            setIsError(true);
          }
        });
    }
  }

  // Redirect to login page upon a successful registration
  //   if (isReset === true) {

  //     return <Redirect to="/auth/login" />;
  //   }

  //   if (isReset === true) {
  //     setInterval(() => {
  //       return <Redirect to="/auth/login" />;
  //     }, 2000);
  //   }

  // Build the Registration Form
  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-2">
            <div>
              <h1 className="text-blue text-center">RESET PASSWORD</h1>
            </div>
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
                      <i className="ni ni-single-02" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="username"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="Username"
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
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="password"
                    value={password2}
                    onChange={e => {
                      setPassword2(e.target.value);
                    }}
                    placeholder="Confirm Password"
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
              <div className="text-center text-muted mb-4">
                {isReset && (
                  <UncontrolledAlert color="success" fade={false}>
                    <span className="alert-inner--text">{successMessage}</span>
                  </UncontrolledAlert>
                )}
              </div>
              <div className="text-center">
                <Button
                  onClick={e => postReset(e)}
                  className="mt-4"
                  color="primary"
                  type="button"
                >
                  Reset Password
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

export default Reset;
