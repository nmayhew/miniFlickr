import React from 'react';
import {
    Typography, Paper, Button
  }
  from '@material-ui/core';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import axios from 'axios';
import './deleteuser.css';
/**
 * deleteUser, a React componment of Photo Share
 */
class Deleteuser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feed: [],
         };
        console.log("deleteuser uploading");
        this.confirmSubmitBound = this.confirmSubmit.bind(this);
    }


    componentDidMount() {
        this.props.topBarChange("Delete User");
    }

    componentWillUnmount() {
        this.props.topBarChange("");
    }

    deleteAccount(){
        //Send logout signal like in topBar
        console.log("running delete");
        let get = axios.get('/deleteuser/'+ this.props.match.params.userId);
        get.then((response) => {
            console.log(response);
            this.props.loggedOut(response.data);
        }).catch((err) => {
            console.log(err);
        })
    }
    //Confirming delete user with modal pop up
    confirmSubmit() {
        console.log("Confirm alert");
        confirmAlert({
          title: 'Confirm to Delete Account',
          message: 'Are you sure to  delete your account?',
          buttons: [
            {
              label: 'Yes',
              onClick: () => this.deleteAccount()
            },
            {
              label: 'No',
              onClick: () => console.log("Cancelled")
            }
          ]
        })
      }

    render() {
        return (
        <div>
         <Paper className="cs142-delete-paper">
            <Typography variant="h3">
                Delete User
            </Typography>
        </Paper>
            <Button  variant="contained" color="primary" onClick={this.confirmSubmitBound}>
                Delete Account
            </Button>   
        </div>
        );
      }

}

export default Deleteuser;