import React from 'react';
import './addPhoto.css';
import {
    Typography, Button, Paper, Box
  }
  from '@material-ui/core';
import axios from 'axios';
import './addPhoto.css';
/**
 * LoginRegister, a React componment of PhotoShare
 */
class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
         };
        this.handleSubmit = this.handleSubmit.bind(this);
        console.log("LoginRegister uploading");
    }

    //Handle Add a photo submit button being pressed 
    handleSubmit(event) {
        event.preventDefault(); 
        if (this.uploadInput.files.length > 0) {
            // Create a DOM form and add the file to it under the name uploadedphoto
            const domForm = new FormData();
            domForm.append('uploadedphoto', this.uploadInput.files[0]);
            axios.post('/photos/new', domForm)
              .then((res) => {
                console.log(res);
              })
              .catch(err => console.log(`POST ERR: ${err}`));
        }
    }

    componentDidMount() {
        this.props.topBarChange("Add Photo");
    }

    componentWillUnmount() {
        this.props.topBarChange("");
    }

    render() {
        return (
        <React.Fragment> 
         <Paper style={{padding: 8, margin: 8, display: "flex",  alignItems: "center", justifyContent: "center"}}>
            <Typography variant="h3" >
                Add a Photo
            </Typography>
        </Paper>
        <Paper style={{padding: 8, margin: 8}}>
        <form onSubmit={event => this.handleSubmit(event)}>
            <Box m={0.6}>
            <Typography variant="body2">
                <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
            </Typography>
            </Box>
            <Button type="submit" variant="contained"> Submit </Button>
        </form>
        </Paper>
        </React.Fragment>
        );
      }

}

export default LoginRegister;