import React from 'react';
import {
  AppBar, Toolbar, Typography, Button
} from '@material-ui/core';

import {
  Link
} from 'react-router-dom'
import './TopBar.css';
import axios from 'axios';

/**
 * TopBar, a React componment of Photoshare
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
  }

  welcomeView() {
    let welcome = "Hi, " + this.props.name;
    let version = "Version: " + this.props.verNo;
    return (
      <React.Fragment>
        {welcome} <Typography variant="body1"> {version} </Typography>
      </React.Fragment>
    );
  }

  //Logging out
  logoutFunc(e){
    console.log("begin logout", e);
    let post = axios.post('admin/logout');
    post.then((response) => {
        //Callback to change loggedIn 
        //Let Photoshare know logged out
        this.props.loggedOut(response.data);
    })
    .catch((err) => {
        console.log(err);
    });
  }
  //Set right handside of top view
  rightView() {
    let logout = "Logout";
    return (
      <React.Fragment>
      <Button variant="outlined" onClick={e => this.logoutFunc(e)} color="inherit">{logout}</Button>
         
      </React.Fragment>
    );
  }
  //Add photo button if logged in
  addPhoto() {
    if (this.props.loggedIn === false) {
      return(
        <React.Fragment>
        </React.Fragment>
      );
    }
    let menuItem = "Add a Photo"
    let path = "/addPhoto"
    return(
      <React.Fragment>
      <Link to={path} key={"addPhotoLink"} className="cs142-topBar-addPhoto">
      <Button variant="outlined" color="inherit">{menuItem} </Button> 
      </Link>
      </React.Fragment>
    );
  }


  render() {
    let logIn = "Please Login";
    let empty = "";
    return (
      <AppBar position="absolute">
        <Toolbar className="cs142-topbar-appBar">
          <Typography variant="h5" color="inherit" className="cs142-topbar-title">
          {this.props.loggedIn ?
            this.welcomeView() : logIn
          }
          </Typography>
          {this.addPhoto()}
          <Typography variant="h6" className="cs142-topbar-info">
          {this.props.loggedIn ?
            this.rightView() : empty
          }
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
