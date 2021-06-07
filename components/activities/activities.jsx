import React from 'react';
import {
    Typography, Paper
  }
  from '@material-ui/core';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import RefreshIcon from '@material-ui/icons/Refresh';
import axios from 'axios';
import './activities.css';
/**
 * Activities, a React componment of PhotoShare
 */
class Activities extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feed: [],
         };
        console.log("LoginRegister uploading");
    }

    fetchFeed() {
        axios.get('/activities/list')
        .then((res) => {
            console.log(res.data);
            this.setState({feed: res.data});
        })
        .catch(err => console.log(`GET ERR: ${err}`));
    }  

    componentDidMount() {
        this.props.topBarChange("Activity feed");
        this.fetchFeed();
    }

    componentWillUnmount() {
        this.props.topBarChange("");
    }

    //Display an activity 
    viewActivity(activity) {
        let text = activity.user.first_name + " " + activity.user.last_name + " " + activity.text; 
        let dateObj = new Date(activity.date_time);
        let date = dateObj.toLocaleString();
        console.log(activity);
        if (activity.photo_needed) {
            let filePath = "../images/" + activity.file_name;
            return (<React.Fragment key={activity._id}>
                <Paper className="cs142-activities-paper">
                    <img src={filePath} className="cs142-activities-img"/>
                    <div className="cs142-activities-div">
                    <Typography variant="body1" >
                        {text}
                    </Typography>
                    <Typography variant="subtitle2" >
                        {date}
                    </Typography>
                    </div>
                </Paper>
            </React.Fragment>);
        }
        return (<React.Fragment key={activity._id}>
        <Paper className="cs142-activities-paper">
            <AccountBoxIcon className="cs142-activities-img"/>
            <div className="cs142-activities-div">
            <Typography variant="body1" >
                {text}
            </Typography>
            <Typography variant="subtitle2" >
                {date}
            </Typography>
            </div>
        </Paper>
        </React.Fragment>);
    }

    render() {
        return (
        <React.Fragment> 
         <Paper className="cs142-activities-paper">
            <Typography variant="h3" >
                Recent Activity Feed
            </Typography>
            <div className="cs142-activities-div">
            <RefreshIcon onClick={() => { this.fetchFeed(); }} className="cs142-activities-refresh"/>
            </div>
        </Paper>
        <Paper style={{padding: 8, margin: 8}}>
            {this.state.feed.map((activity) => (
                this.viewActivity(activity)
              ))}
        </Paper>
        </React.Fragment>
        );
      }

}

export default Activities;