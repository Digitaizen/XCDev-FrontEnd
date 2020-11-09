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
// import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
// import Maps from "views/examples/Maps.js";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
// import Tables from "views/examples/Tables.js";
// import Icons from "views/examples/Icons.js";
import LabInventory from "views/examples/LabInventory";
import Reset from "views/examples/Reset";
import FactoryImaging from "views/examples/FactoryImaging";
import SearchInventory from "views/examples/SearchInventory";
// import App from "App";

var routes = [
  // {
  //   path: "/index",
  //   name: "Dashboard",
  //   icon: "ni ni-tv-2 text-primary",
  //   component: Index,
  //   layout: "/admin",
  //   invisible: true
  // },
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "ni ni-planet text-blue",
  //   component: Icons,
  //   layout: "/admin",
  //   invisible: true
  // },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "ni ni-pin-3 text-orange",
  //   component: Maps,
  //   layout: "/admin",
  //   invisible: true
  // },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: Profile,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Lab Inventory",
    icon: "ni ni-bullet-list-67 text-red",
    component: LabInventory,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: Register,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/reset",
    name: "Reset",
    icon: "ni ni-circle-08 text-pink",
    component: Reset,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/factoryImaging",
    name: "Factory Imaging",
    icon: "fas fa-robot text-green", //"ni ni-settings-gear-65 text-green",
    component: FactoryImaging,
    layout: "/admin",
  },
  {
    path: "/SearchInventory",
    name: "Component Search",
    icon: "fas fa-search text-blue",
    component: SearchInventory,
    layout: "/admin",
  },
];
export default routes;
