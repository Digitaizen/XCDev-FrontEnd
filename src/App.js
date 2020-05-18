import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
// import AdminLayout from "./layouts/Admin.js";
import Admin from "./layouts/Admin.js";
import AuthLayout from "./layouts/Auth.js";

import { AuthContext } from "./context/auth";

const App = () => {
  const [authTokens, setAuthTokens] = useState();

  const setTokens = data => {
    localStorage.setItem("tokens", JSON.stringify(data));
    setAuthTokens(data);
  };

  return (
    <AuthContext.Provider value={{ authTokens, setAuthTokens: setTokens }}>
      <Router>
        <Switch>
          <Route exact path="/" render={props => <AuthLayout {...props} />} />
          <PrivateRoute path="/admin" component={Admin} />
          <Route path="/auth" render={props => <AuthLayout {...props} />} />
          <Route
            path="/auth/register"
            render={props => <AuthLayout {...props} />}
          />

          {/* <Redirect from="/" to="/admin/index" /> */}
        </Switch>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
