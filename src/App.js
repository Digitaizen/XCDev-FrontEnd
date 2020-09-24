import React, { useReducer, useState } from "react";
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

export const SearchContext = React.createContext();

// Initialize the search state with an empty array
const initialState = [];
// Function using useReducer hook to share state among components
const reducer = (state, action) => {
  // console.log(`Reducer function called with action type of '${action.type}'`);
  switch (action.type) {
    case "saveServiceTags":
      console.log(`Saving service tags to state.`);
      // console.log(action.payload);
      state = action.payload;
      break;

    case "resetState":
      console.log("Reseting state to: []");
      state = initialState;
      break;

    default:
      console.log(`Default state is returned.`);
      // console.log(state);
      break;
  };
  return state;
};

const App = () => {
  const [authTokens, setAuthTokens] = useState();
  const [userInfo, setUserInfo] = useState({});
  const [state, dispatch] = useReducer(reducer, initialState);

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
        <SearchContext.Provider value={{ tagsState: state, setTagsState: dispatch }}>
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
        </SearchContext.Provider>
      </UserInfoContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
