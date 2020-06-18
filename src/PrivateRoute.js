import React from "react";
import { Route, Redirect } from "react-router-dom";
// import { useAuth } from "./context/auth";

function PrivateRoute({ component: Component, ...rest }) {
  // const { authTokens } = useAuth();
  // console.log("AuthTokens" + authTokens);
  const isAuth = localStorage.getItem("tokens");

  return (
    <Route
      {...rest}
      render={props =>
        isAuth ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect to={{ pathname: "/auth" }} />
        )
      }
    />
  );
}

export default PrivateRoute;
