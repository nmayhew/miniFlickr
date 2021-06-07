import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Redirect, Switch
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import AddPhoto from './components/addPhoto/addPhoto';
import LoginRegister from './components/loginRegister/loginRegister';
import Activities from './components/activities/activities';
import Deleteuser from './components/deleteUser/deleteuser';
import axios from 'axios';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainComp: "Home",
      verNo: "x",
      name: "X",
      loggedIn: false,
      loggedUserID: ""
    }
    this.mainComponentChangedBound = topBarVal => this.mainComponentChanged(topBarVal, this);
    this.loggedInChangedBound = loggedIn => this.loggedInChanged(loggedIn, this);
    this.loggedOutChangedBound = loggedOut => this.loggedOutChanged(loggedOut, this);
  }

  mainComponentChanged(topBarVal, self) {
    self.setState({
      mainComp: topBarVal,
    });
  }

  //Handle browser refreshing
   handleRefresh(){
    let fetch = axios.get('/checkrefresh');
    fetch.then((response) => {
      this.setState({
        name: response.data.fullname,
        loggedUserID: response.data.userID,
        loggedIn: true,
      });
      console.log("Found log in pre-exisiting");
    })
    .catch((err) => {
      console.log(err);
      this.setState({
        loggedIn: false,
      });
    });
  }

  loggedInChanged(user, self) {
    console.log("LoggedIn now changed to, ", user);
    let nameFull = user.first_name + " " + user.last_name;
    self.setState({
      name: nameFull,
      loggedUserID: user._id,
      loggedIn: true,
    });
  }

  loggedOutChanged(logOut, self) {
    console.log("Logging out in photoShare")
    self.setState({
      loggedIn: false,
      name: "",
    });
  }

  //Version number updated
  vNumberUpdated(versionNo){
    this.setState({
      verNo: versionNo,
    })
  }

  fetchData() {
    let fetch = axios.get('/test/info');
    fetch.then((response) => {
      this.vNumberUpdated(response.data.__v);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  componentDidUpdate(prevProps, prevState){
    let loggedIn = this.state.loggedIn;
    if (loggedIn !== prevState.loggedIn) {
      this.fetchData();
    }
  }

  componentDidMount(){
    this.handleRefresh()
    this.fetchData();
  }

  isLoggedIn() {
    return this.state.loggedIn;
  }

  render() {

    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar loggedIn={this.isLoggedIn()} loggedOut={this.loggedOutChangedBound} name={this.state.name} mainComp={this.state.mainComp} verNo={this.state.verNo}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper  className="cs142-main-grid-item">
            <UserList loginID={this.state.loggedUserID} loggedIn={this.isLoggedIn()}/>
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
            {this.isLoggedIn() ?
                <Redirect path="/login-register" to="/user" />
                :
                  <Route path="/login-register" 
                  render ={ props => <LoginRegister loggedIn={this.loggedInChangedBound} {...props}/>}
                  /> 
                }
            {this.isLoggedIn() ?
              <Route path="/users/:userId" exact
                        render={ props => <UserDetail topBarChange={this.mainComponentChangedBound} {...props}/> }
                />
                  :
                    <Redirect path="/users/:id" to="/login-register" />
                  }
            {this.isLoggedIn() ?
              <Route path="/photos/:userId" exact
                    render ={ props => <UserPhotos loginID={this.state.loggedUserID} topBarChange={this.mainComponentChangedBound} {...props}/> }
                  />
                  :
                    <Redirect path="/photos/:userId" to="/login-register" />
                  }
            {this.isLoggedIn() ?
                  <Route path="/" exact />
                  :
                    <Redirect path="/" to="/login-register" />
                  }
            {this.isLoggedIn() ?
                  <Route path="/users" exact component={UserList}  />
                  :
                    <Redirect path="/users" to="/login-register" />
                }
              {this.isLoggedIn() ?
                  <Route path="/addPhoto" exact
                    render ={ props => <AddPhoto topBarChange={this.mainComponentChangedBound} {...props}/> } />
                  :
                    <Redirect path="/users" to="/login-register" />
                }
                {this.isLoggedIn() ?
                  <Route path="/activities" exact
                    render ={ props => <Activities topBarChange={this.mainComponentChangedBound} {...props}/> } />
                  :
                    <Redirect path="/users" to="/login-register" />
                }
                {this.isLoggedIn() ?
                  <Route path="/deleteuser/:userId" exact
                    render ={ props => <Deleteuser topBarChange={this.mainComponentChangedBound}  loggedOut={this.loggedOutChangedBound} {...props}/> } />
                  :
                    <Redirect path="/users" to="/login-register" />
                }
                </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);