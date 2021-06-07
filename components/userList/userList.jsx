import React from 'react';
import { HashRouter, Link } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
}
from '@material-ui/core';
import './userList.css';

import axios from 'axios';
/**
 * userList, a React componment of Photoshare
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userIds: [],
    }
  }

  viewUsersList(user){
    if (this.props.loggedIn === false) {
      return (
        <React.Fragment>
        </React.Fragment>
      );
    }
    let path = "/users/"+ user._id;
    let name = user.first_name + " " + user.last_name;
    return (
      <React.Fragment key={path}>
        <Link to={path} key={user._id} className="cs142-userList-ListItem">
          <ListItem key={path} className="cs142-userList-ListItem">
            <ListItemText primary={name} />  
          </ListItem>
        </Link>
        <Divider />
      </React.Fragment>
    );
  } 

  usersUpdated(users) {
    this.setState({
      userIds: users,
    });
  }

  fetchData(){
    let fetch = axios.get('/user/list');
    fetch.then((response) => {
        this.usersUpdated(response.data);
      })
      .catch((err) => {
      // err.response.{status, data, headers) - Non-2xxx status
      // if !err.response - No reply, can look at err.request
      if (err.response.status === 401) {
        this.setState({
          userIds: [],
        });
      }
      console.log(err);
      });
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.loggedIn !== prevProps.loggedIn) {
      if(this.props.loggedIn === true) {
        this.fetchData();
      } else {
        this.setState({
          userIds: [],
        });
      }
      
    }
  }
  //Add Activity feed Button
  activities() {
    if (this.props.loggedIn === false) {
      return(
        <React.Fragment>
        </React.Fragment>
      );
    }
    let menuItem = "Activity Feed"
    let path = "/activities"
    return(
      <React.Fragment>
      <Link to={path} key={"activitiesLink"} className="cs142-userList-ListItem">
        <ListItem key={"activities"} className="cs142-userList-ListItem">
          <ListItemText primary={menuItem} />  
        </ListItem>
      </Link>
      <Divider />
      </React.Fragment>
      
    );
  }

  //Add Delete User Button
  deleteUser() {
    if (this.props.loggedIn === false) {
      return(
        <React.Fragment>
        </React.Fragment>
      );
    }
    let menuItem = "Delete Account"
    let path = "/deleteuser/"+ this.props.loginID;
    return(
      <React.Fragment>
      <Link to={path} key={"deleteUserLink"} className="cs142-userList-ListItem">
        <ListItem key={"delete"} className="cs142-userList-ListItem">
          <ListItemText primary={menuItem} />  
        </ListItem>
      </Link>
      <Divider />
      </React.Fragment>
      
    );
  }

  render() {
    return (
      <div>
        <Typography variant="h6" className="cs142-userList-title">
          Users:
        </Typography>
        <HashRouter> 
          <List component="nav">
            {this.state.userIds.map((user) => (
              this.viewUsersList(user)
            ))}
            {this.activities()}
            {this.deleteUser()}
          </List>
        </HashRouter> 
      </div>
    );
  }
}

export default UserList;
