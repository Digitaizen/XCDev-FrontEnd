import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
// import AdminLayout from "./layouts/Admin.js";
import Admin from "./layouts/Admin.js";
import AuthLayout from "./layouts/Auth.js";
import { AuthContext } from "./context/auth";
import { UserInfoContext } from "./context/UserInfoContext";

const App = () => {
  const [authTokens, setAuthTokens] = useState();
  const [userInfo, setUserInfo] = useState({});

  const setUser = data => {
    localStorage.setItem("user", JSON.stringify(data));
    setUserInfo(data);
  };

  const setTokens = data => {
    localStorage.setItem("tokens", JSON.stringify(data));
    setAuthTokens(data);
  };

  return (
    <AuthContext.Provider value={{ authTokens, setAuthTokens: setTokens }}>
      <UserInfoContext.Provider value={{ userInfo, setUserInfo: setUser }}>
        <Router>
          <Switch>
            <Route exact path="/" render={props => <AuthLayout {...props} />} />
            <PrivateRoute path="/admin" component={Admin} />
            <Route path="/auth" render={props => <AuthLayout {...props} />} />
            <Route
              path="/auth/register"
              render={props => <AuthLayout {...props} />}
            />
            <Route
              path="/auth/reset"
              render={props => <AuthLayout {...props} />}
            />

            <Redirect from="/" to="/auth/login" />
          </Switch>
        </Router>
      </UserInfoContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
