import React from 'react';
import './loginRegister.css';
import {
    Typography, 
    Grid, 
    TextField,
    Button,
    Box,
    Paper
  }
  from '@material-ui/core';
import axios from 'axios';
/**
 * loginRegister, a React componment of Photoshare
 */
class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginName: "",
            enterText: "Login:",
            password: "",
            createPassword: "",
            createPasswordCopy: "",
            createLoginName: "",
            firstName: "",
            surname: "",
            location: "",
            description: "",
            occupation: "",
            errSuccesMessage: "",
         };
        this.handleChangeloginName = this.handleChangeloginName.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);

        this.handleRegister = this.handleRegister.bind(this);
        this.handleChangePasswordCreate = this.handleChangePasswordCreate.bind(this);
        this.handleChangePasswordCreateCopy = this.handleChangePasswordCreateCopy.bind(this);
        this.handleChangeLoginNameCreate = this.handleChangeLoginNameCreate.bind(this);
        this.handleChangeFirstName = this.handleChangeFirstName.bind(this);
        this.handleChangeSurname = this.handleChangeSurname.bind(this);
        this.handleChangeLocation = this.handleChangeLocation.bind(this);
        this.handleChangeDescription = this.handleChangeDescription.bind(this);
        this.handleChangeOccupation = this.handleChangeOccupation.bind(this);

    }
    //Handle Login ins
    handleChangePassword(event) {
        this.setState({password: event.target.value});
    }
    handleChangeloginName(event) {
        this.setState({loginName: event.target.value});
    }
    //Handle login button being pressed
    handleSubmit(event) {
        event.preventDefault(); // Need to stop DOM from generating a POST
        let post = axios.post('/admin/login', { login_name: this.state.loginName, password: this.state.password  });
        post.then((response) => {
            //Callback to change loggedIn 
            console.log(response.data);
            this.props.loggedIn(response.data);
        })
        .catch((err) => {
            console.log(err);
            this.setState({
                enterText: "Incorrect login name or password, please try again:"
            });
        });
    }


    //HANDLE Register
    handleChangePasswordCreate(event) {
        this.setState({createPassword: event.target.value});
    }
    handleChangePasswordCreateCopy(event) {
        this.setState({createPasswordCopy: event.target.value});
    }
    handleChangeLoginNameCreate(event) {
        this.setState({createLoginName: event.target.value});
    }
    handleChangeFirstName(event) {
        this.setState({firstName: event.target.value});
    }
    handleChangeSurname(event) {
        this.setState({surname: event.target.value});
    }
    handleChangeLocation(event) {
        this.setState({location: event.target.value});
    }
    handleChangeDescription(event) {
        this.setState({description: event.target.value});
    }
    handleChangeOccupation(event) {
        this.setState({occupation: event.target.value});
    }

    //Handle Register button being pressed
    handleRegister(event) {
        // Process submit from this.state
        event.preventDefault(); // Need to stop DOM from generating a POST
        let newUser = {};
        newUser.login_name = this.state.createLoginName;
        newUser.password = this.state.createPassword;
        newUser.first_name = this.state.firstName;
        newUser.last_name = this.state.surname;
        newUser.location = this.state.location;
        newUser.description = this.state.description;
        newUser.occupation = this.state.occupation;

        let post = axios.post('/user', newUser);
        post.then((response) => {
            //Callback to change loggedIn 
            console.log(response.data);
            this.setState({
                errSuccesMessage: "Registration completed ",
                createPassword: "",
                createPasswordCopy: "",
                createLoginName: "",
                firstName: "",
                surname: "",
                location: "",
                description: "",
                occupation: "",
            });
        })
        .catch((err) => {
            console.log(err.response.data);
            this.setState({
                errSuccesMessage: err.response.data,
            }); 
            
        });
    }

    //Ensuring passwords match
    diffPasswords() {
        return (
            <Typography variant="subtitle2">
                Passwords do not match, please retype them
            </Typography>
        )
    }

    render() {
        let samePasswords = true;
        if (this.state.createPasswordCopy === this.state.createPassword) {
            samePasswords = false;
        }
        return (
        <React.Fragment>
        <Paper style={{padding: 8, margin: 8, display: "flex",  alignItems: "center", justifyContent: "center"}}>
            <Typography variant="h3">
            Welcome to Photo App! Please log in or register
            </Typography>
        </Paper>
        <Grid container direction="row">
        <Grid>
        <Paper style={{padding: 8, margin: 8}}>
        <Typography variant="body1">
            {this.state.enterText}
        </Typography>
        <form onSubmit={event => this.handleSubmit(event)}>
            <Box m={0.6}>
                <Box m={0.6}>
                 <TextField label="Login Name:" variant="outlined" type="text" value={this.state.loginName} onChange={this.handleChangeloginName} />
                 </Box>
                 <Box m={0.6}>
                 <TextField label="Password:" variant="outlined" type="password" value={this.state.password} onChange={this.handleChangePassword} />
                 </Box>
            </Box>
            <Box m={0.6}>
            <Button type="submit" variant="contained"> Submit</Button>
            </Box>
        </form>
        </Paper>
        </Grid>


        <Grid>
        <Paper style={{padding: 8, margin: 8}}>
        <Typography variant="body1">
            Register new user:
        </Typography>
        <form onSubmit={event => this.handleRegister(event)}>
            <Box m={0.6}>
                <Box m={0.6}>
                 <TextField label="Create Login Name:"  variant="outlined" type="text"  value={this.state.createLoginName} onChange={this.handleChangeLoginNameCreate} />
                 </Box>
                 <Box m={0.6}>
                 <TextField label="Create Password:"  variant="outlined" type="password" value={this.state.createPassword} onChange={this.handleChangePasswordCreate} />
                 </Box>
                
                <Box m={0.6 }>
                 <TextField label="Retype Password:" variant="outlined" type="password"  value={this.state.createPasswordCopy} onChange={this.handleChangePasswordCreateCopy} />
                 
                 </Box>
                 <Box m={0.6}>
                 <TextField label="First Name:"  variant="outlined" type="text"  value={this.state.firstName} onChange={this.handleChangeFirstName} />
                 </Box>
                <Box m={0.6}>
                 <TextField label="Surname:" variant="outlined" type="text"  value={this.state.surname} onChange={this.handleChangeSurname} />
                 </Box>
                 <Box m={0.6}>
                 <TextField label="Location:" variant="outlined" type="text"  value={this.state.location} onChange={this.handleChangeLocation} />
                </Box>
                <Box m={0.6}>
                 <TextField label="Description:"  variant="outlined" type="text"  value={this.state.description} onChange={this.handleChangeDescription} />
                 </Box>
                 <Box m={0.6}>
                 <TextField label="Occupation:" variant="outlined" type="text"  value={this.state.occupation} onChange={this.handleChangeOccupation} />
                 </Box>
            </Box>
            {samePasswords?
                    this.diffPasswords()
                :
                <Button type="submit" variant="contained">Register me</Button>
                }
        </form>
        <Typography variant="subtitle2">
                {this.state.errSuccesMessage}
        </Typography>
        </Paper>
        </Grid>
        </Grid> 
        </React.Fragment>
        );
      }

}

export default LoginRegister;
