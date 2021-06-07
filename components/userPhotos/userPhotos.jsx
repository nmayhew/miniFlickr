import React from 'react';
import { HashRouter, Link } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  Divider,
  TextField,
  Button,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import DeleteIcon from '@material-ui/icons/Delete';
import './userPhotos.css';
import axios from 'axios';


/**
 *  UserPhotos, a React componment of Photoshare
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: [],
      userPhotos: [],
      commentAdd: [],
      refresh: false,
    }

    this.handleChangeInput = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

//Handle change in input of comment
handleChange(event) {
    let commentsAddNew = this.state.commentAdd
    commentsAddNew[event.target.name] = event.target.value
    console.log(commentsAddNew);
    this.setState({
      commentAdd: commentsAddNew,
    });
}
handleSubmit(event) {
    // Process submit from this.state
    event.preventDefault(); // Need to stop DOM from generating a POST
    let commentTextArry = this.state.commentAdd;
    let commentText = commentTextArry[event.target.name];
    let photoID = event.target.name;
    let url = '/commentsOfPhoto/' + photoID;
    let post = axios.post(url, { comment: commentText});
    post.then((response) => {
        console.log(response.data);

        commentTextArry[photoID] = "";
        this.setState({
          refresh: true,
          commentAdd: commentTextArry,
        });
    })
    .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          console.log("Bad Request");
        }
    });
}

  componentDidMount() {
    let newUserId = this.props.match.params.userId;
    this.callFetchPhoto(newUserId);
    this.callFetchPerson(newUserId);
  }

  componentWillUnmount() {
    this.props.topBarChange("");
  }

  userDidUpdate(user) {
    this.setState({
      userInfo: user,
    })
    let first = user.first_name 
    let last = user.last_name
    let topBar = "Photos of " + first + " "+ last;
    this.props.topBarChange(topBar); 
  }

  photoDidUpdate(photos) {
    this.setState({
      userPhotos: photos,
    })
  }

  callFetchPhoto(newUserId){
    let fetch = axios.get('/photosOfUser/'+ newUserId);
    fetch.then((response) => {
      this.photoDidUpdate(response.data);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  callFetchPerson(newUserId){
    let fetch = axios.get('/user/'+ newUserId);
    fetch.then((response) => {
      this.userDidUpdate(response.data);
    })
    .catch((err) => {
      console.log(err);
    });
  }
  
  componentDidUpdate(prevProps) {
    let newUserId = this.props.match.params.userId;
    if (newUserId!== prevProps.match.params.userId || this.state.refresh) {
      this.setState({
        refresh: false,
      });
      this.callFetchPhoto(newUserId);
      this.callFetchPerson(newUserId);
    }
  }

  viewComment(comment, photoID) {
    console.log(comment);
    let user = comment.user;
    let userName = user.first_name + " " + user.last_name;
    let dateObj = new Date(comment.date_time);
    let dateComment = " -- " + dateObj.toLocaleString();
    let path = "/users/"+ user._id;
    let ownComment = false; 
    if (comment.user._id === this.props.loginID) {
      ownComment = true;
    }
    let empty = "";
      return (
      <React.Fragment key={comment._id}>
          <Divider />
          <ListItem key={comment._id} >
            <ListItemText primary={comment.comment} 
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2">
                  <Link to={path} key={user._id} className="">
                      {userName}
                    </Link>
                    </Typography>
                  {dateComment}
                </React.Fragment>} 
                className="cs142-userPhotos-comments"
            />  
            {ownComment ? 
              <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => { this.deleteComment(comment, photoID); }}>
                      <DeleteIcon />
                    </IconButton>
            </ListItemSecondaryAction>
            : empty }
            
          </ListItem>
      </React.Fragment>);
  }

  deleteComment(comment, photoID) {
    let url = '/deletecomment/';
    let post = axios.post(url, {commentA: comment, photoID: photoID, userID: this.props.loginID});
    post.then((response) => {
      console.log(response);
      this.setState({
        refresh: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  addCommentingAbility(photo) {
    let uniqueComment = photo._id + "commentAdd"
    let commentValueArray = this.state.commentAdd;
    let commentValue = commentValueArray[photo._id];
    return ( 
      
      <ListItem key={uniqueComment} >
        <form name={photo._id} onSubmit={event => this.handleSubmit(event)}>
            <Typography variant="body2" className="cs142-userPhotos-commentsAddOuter">
                <TextField type="text"  value={commentValue} placeholder="Add Comment" name={photo._id} onChange={this.handleChangeInput} />
                <Button type="submit" variant="contained" className="cs142-userPhotos-commentsAdd"> Add </Button>
            </Typography>
        </form>
        </ListItem>
        );

  }

  changeLike(photoID) {
    console.log("clicked");
    let url = '/changelike/'+ photoID
    let post = axios.post(url, {userID: this.props.loginID});
    post.then((response) => {
      console.log(response);
      this.setState({
        refresh: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });

  }

  deletePhoto(photoID) {
    console.log("Deleting photo");
    let url = '/deletephoto/'+ photoID;
    let fetch = axios.post(url, {userID: this.props.loginID});
    fetch.then((response) => {
      console.log(response);
      this.setState({
        refresh: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }


  viewPhoto(photo) {
    let filePath = "../images/" + photo.file_name;
    let dateObj = new Date(photo.date_time);
    let caption = "Photo Taken: " + dateObj.toLocaleString();
    let empty = ""
    let addComments = true;
    if (typeof photo.comments === 'undefined') {
      addComments = false;
    }
    let filledIn = false;
    console.log(this.props.loginID);
    if (photo.likes.includes(this.props.loginID)) {
      //Filled in 
      filledIn = true;
    } 
    let likeCount = photo.likes.length;
    let likeString = likeCount + " Likes";
    if (likeCount === 1) {
      likeString = "1 Like"
    }
    let ownPhoto = false;
    if (this.props.loginID === this.props.match.params.userId) {
      ownPhoto = true;
    }
    return (
      <React.Fragment key={filePath}>
        <Card className="cs142-userPhotos-card">
        <img src={filePath} className="cs142-userPhotos-img"/>
        <div className="cs142-userPhotos-likecontain">
        <div className="cs142-userPhotos-innercontain">
          {filledIn ?  <FavoriteIcon className="cs142-userPhotos-like" onClick={() => { this.changeLike(photo._id); }}/> : 
          <FavoriteBorderIcon className="cs142-userPhotos-like" onClick={() => { this.changeLike(photo._id); }}/>} 
          <Typography variant="subtitle1" >{likeString}</Typography>
        </div>
          {ownPhoto? <DeleteForeverIcon className="cs142-userPhotos-delete" onClick={() => { this.deletePhoto(photo._id);}} /> : empty}
        </div>
        <Typography variant="subtitle1" className="cs142-userPhotos-caption">{caption}</Typography>
        <HashRouter>
          <List>
              {addComments ? photo.comments.map((comment) => (
                this.viewComment(comment, photo._id)
              )) : empty}
              {this.addCommentingAbility(photo)}
          </List>
        </HashRouter>
        </Card>
      </React.Fragment>

    );
  } 

  render() {
    let copyPhotos = this.state.userPhotos;
    copyPhotos.sort(function(a, b) {
      let diff = parseFloat(b.likes.length) - parseFloat(a.likes.length);
      console.log("diff", diff);
      if (diff === 0) {
        let dateA = new Date(a.date_time);
        let dateB = new Date(b.date_time);
        return dateB - dateA;
      } else {
        return diff;
      }
  })
    return (
      <div className="cs142-userPhotos-div">
          {copyPhotos.map((photo) => (
              this.viewPhoto(photo)
            ))}
      </div>

    );
  }
}

export default UserPhotos;
