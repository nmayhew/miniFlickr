import React from 'react';
import {
  Typography,
  Divider
} from '@material-ui/core';
import './userDetail.css';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WorkIcon from '@material-ui/icons/Work';
import { HashRouter, Link } from "react-router-dom";

import axios from 'axios';
/**
 * UserDetail, a React componment of Photoshare
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: [],
    }
  }

  componentDidMount() {
    let newUserId = this.props.match.params.userId;
    this.callFetch(newUserId);
  }

  userUpdated(user) {
    this.setState({
      userInfo: user,
    });
    let first = user.first_name;
    let last = user.last_name;
    let topBar = first + " "+ last + "'s Description";
    this.props.topBarChange(topBar);
  }

  //Fetches user info
  callFetch(newUserId){
    let fetch = axios.get('/user/'+ newUserId);
    fetch.then((response) => {
      this.userUpdated(response.data);
    })
    .catch((err) => {
      console.log(err);
    });
  }
  

  componentDidUpdate(prevProps) {
    let newUserId = this.props.match.params.userId
    if (newUserId !== prevProps.match.params.userId) {
      this.callFetch(newUserId);
    }
  }

  componentWillUnmount() {
    this.props.topBarChange("");
  }
  
  //Link to user photos
  photoLink(){
    let path = "/photos/"+this.state.userInfo._id;
    return (
      <HashRouter>
      <div className="cs142-userDetails-divButton">
      <Link to={path} className="cs142-userDetails-buttonText">
        <button className="cs142-userDetails-button">
          <Typography variant="h6">
             Photos
          </Typography>
        </button>
      </Link>
      </div>
      </HashRouter>
    );
  }


  render() {
    
    return (
      <React.Fragment> 
      <div className="cs142-userDetails-header">
        <Typography variant="h6" className="cs142-userDetails-title">
          {this.state.userInfo.first_name} {this.state.userInfo.last_name}
        </Typography>       
        <Typography variant="h6" className="cs142-userDetails-center">
            <LocationOnIcon className="cs142-userDetails-logo"/> {this.state.userInfo.location}
          <WorkIcon className="cs142-userDetails-logoS"/>{this.state.userInfo.occupation}
        </Typography> 
      </div> 
      <Divider />
      <Typography variant="body1" className="cs142-userDetails-body">
        {this.state.userInfo.description}
      </Typography>
      {this.photoLink()}

      </React.Fragment>
    );
  }
}

export default UserDetail;
