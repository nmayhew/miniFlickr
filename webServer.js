
"use strict";

/* jshint node: true */

const passwordFunc = require('./cs142password.js'); 
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');


/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");
var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var Feed = require('./schema/feed.js');

var express = require('express');
var app = express();

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(session({secret: 'cnsi1c2k4pmraoyjheecwt', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

//Trial http Request
app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
* URL /admin/login - Handle login http post request
*/
app.post('/admin/login', function (request, response) {
    let query = User.findOne({login_name: request.body.login_name});
    query.select("_id first_name last_name login_name password password_digest salt").exec(function (err, user) {
        if (err) {
            console.error('Err', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.error('Err', err);
            response.status(400).send("User Not found");
            return;
        } 
        let fullName = user.first_name + " " + user.last_name;
        if (passwordFunc.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
            request.session.user_id = user._id;
            request.session.login_name = user.login_name;
            request.session.fullname = fullName;
            //New activity login
            let newActivity = new Feed;
            newActivity.photo_needed = false;
            newActivity.user_id = user._id;
            newActivity.date_time = new Date();
            newActivity.text = "logged in";
            newActivity.file_name = "";
            newActivity.save();
            response.status(200).send(JSON.stringify(user));
            return;
        } else {
            response.status(400).send("Wrong password");
            return;
        }
    });
});

/*
* URL /admin/logout - Handle Logout http post request
*/
app.post('/admin/logout', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(500).send("error")
        return;
    }
    let id = request.session.user_id;
    request.session.destroy(function (err) { 
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        } else {
            //New Activity Logout
            let newActivity = new Feed;
            newActivity.photo_needed = false;
            newActivity.user_id = id;
            newActivity.date_time = new Date();
            newActivity.text = "logged out";
            newActivity.file_name = "";
            newActivity.save();
            response.status(200).send("Logged Out");
            return;
        }
    });
});

/*
* URL /commentsOfPhoto/:photo_id - Get comments of the photo
*/
app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    let userID = request.session.user_id;
    if (userID === undefined) {
        response.status(500).send("error");
        return;
    }
    if (request.body.comment === "" || request.body.comment === undefined) {
        response.status(400).send("Empty Comment");
        return;
    }
    let photo_id = request.params.photo_id;
    Photo.findOne({_id: photo_id}, function (err, photo) {
        let newComment = {}
        newComment.date_time = new Date();
        newComment.comment = request.body.comment;
        newComment.user_id = request.session.user_id;
        photo.comments = photo.comments.concat(newComment);
        photo.save(); //Write updated photo object to the database
        //New Activity Comment
        let newActivity = new Feed;
        newActivity.photo_needed = true;
        newActivity.user_id = request.session.user_id;
        newActivity.date_time = new Date();
        newActivity.text = "commented on a photo";
        newActivity.file_name = photo.file_name;
        newActivity.save();
        response.status(200).send("Successful Update");
        return;
    });
});

/*
* URL /user - register a new user
*/
app.post('/user', function (request, response) {
    //Validation checks The post request handler must make sure that the new login_name is specified
    // and doesn't already exist. The first_name, last_name, and password must be non-empty
    // strings as well. If the information is valid, then a new user is created in the database.
    // If there is an error, the response should return status 400 and a string indicating the error.
    if (request.body.login_name === "") {
        console.log("login name is empty,", request.body.login_name);
        response.status(400).send("Login name is empty. Please reregister");
        return;
    } else if (request.body.password === "") {
        console.log("password is empty");
        response.status(400).send("Password is empty. Please reregister");
        return;
    } else if (request.body.first_name === "") {
        console.log("first name is empty");
        response.status(400).send("First name is empty. Please reregister");
        return;
    } else if (request.body.last_name === "") {
        console.log("last name is empty");
        response.status(400).send("Last name is empty. Please reregister");
        return;
    } else {
        User.findOne({login_name: request.body.login_name}, function (err, user) {
            if (user !== null && !err) {
                console.log("Login Name is already being used ");
                response.status(400).send("Login name is already being used. Please reregister");
                return;
            } else {
                console.log("creating User");
                let user = new User;
                user.first_name = request.body.first_name;
                user.last_name = request.body.last_name;
                user.location = request.body.location;
                user.description = request.body.description;
                user.occupation = request.body.occupation;
                user.login_name = request.body.login_name;
                let passObj = passwordFunc.makePasswordEntry(request.body.password);
                user.password_digest = passObj.hash;
                user.salt = passObj.salt;
                user.save();
                //New Activity User
                let newActivity = new Feed;
                newActivity.photo_needed = false;
                newActivity.user_id = user._id;
                newActivity.date_time = new Date();
                newActivity.text = "registered";
                newActivity.file_name = "";
                newActivity.save();
                response.status(200).send("Completed");
                return;
            }
        });
    }
});

/*
* URL /photos/new - Handle a http request to add a new photo
*/
app.post('/photos/new', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(500).send("error")
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("Invalid Photo adding");
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
        if (request.file.hasOwnProperty("fieldname") && request.file.hasOwnProperty("originalname") 
                && request.file.hasOwnProperty("mimetype") && request.file.hasOwnProperty("buffer")
                && request.file.hasOwnProperty("size")) {
                    if (request.file.fieldname !== 'uploadedphoto') {
                        response.status(500).send("fieldname doesn't equal uploadedphoto");
                        return;
                    }
         } else {
            response.status(500).send("file doesn't have correct properties");
            return;
        }
        
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                response.status(500).send("couldn't write image");
                return;
            }
            let newPhoto = new Photo;
            newPhoto.file_name = filename;
            newPhoto.date_time = new Date();
            newPhoto.user_id = request.session.user_id;
            newPhoto.likes = [];
            let commentsNew;
            newPhoto.comments = commentsNew;
            newPhoto.save();
            //New Activity
            let newActivity = new Feed;
            newActivity.photo_needed = true;
            newActivity.user_id = request.session.user_id;
            newActivity.date_time = new Date();
            newActivity.text = "uploaded a photo";
            newActivity.file_name = filename;
            newActivity.save();
            response.status(200).send("Completed");
            return;

        });
    });
});

/*
* URL /activities/list - Get list of activities for activities feed in order 
*/
app.get('/activities/list', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(500).send("error");
        return;
    }
    let query = Feed.find({});
    query.select("_id photo_needed user_id date_time text file_name");
    query.sort("date_time").exec(function (err, activities) {
        if(err) {
            response.status(500).send("error");
            return;
        } 
        else {
            console.log("Full activities,", activities);
            let copyActivities = JSON.parse(JSON.stringify(activities.reverse()));
            if (copyActivities.length > 5) {
                copyActivities.length = 5;
            }
            async.each(copyActivities, function (activity, done_callbackInner) {
                console.log("Activity:", activity);
                let userID = activity.user_id;
                delete activity.user_id;
                let queryIn = User.findOne({_id: userID});
                queryIn.select("_id first_name last_name").exec (function (err, userInfo) {
                    console.log ("User: ", userInfo);
                    if (err) {
                        response.status(400).send(JSON.stringify(err));
                        done_callbackInner(true);
                    } 
                    activity.user = userInfo;
                    done_callbackInner();
                });
            }, function (err) {
                if (err) {
                    response.status(400).send(err);
                    return;
                } else {
                    response.status(200).send(JSON.stringify(copyActivities));
                    return;
                }
            });
        }
    });
});

/*
* URL /checkrefresh - Handle check refresh by checking for current session
*/
app.get('/checkrefresh', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    } else {
        let user = {fullname: request.session.fullname, userID: request.session.user_id}
        response.status(200).send(user);
        return;
    }
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.send(JSON.stringify(info[0]));
            return;
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
                return;
            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
        return;
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    console.log('/user/list');
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }
    let query = User.find({});
    query.select("_id first_name last_name");
    query.sort("first_name").exec(function (err, users) {
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            // Query didn't return an error but didn't find the User object
            response.status(500).send('Missing user list');
            return;
        }
        // We got the users - return it in JSON format.
        response.status(200).send(JSON.stringify(users));
        return;
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    console.log("In user/id")
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }
    var user_id = request.params.id;
    let query = User.findOne({_id: user_id});
    query.select("_id first_name last_name location description occupation").exec(function (err, user) {
        if (err) {
            console.error('Erroneous user id:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.status(200).send(JSON.stringify(user));
        return;
    });
});

app.get('/deleteuser/:id', function(request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }
    let userId = request.params.id;
    if (userId !== request.session.user_id) {
        response.status(401).send("Trying to delete not their account");
        return;
    }
    //Delete all photos
    Photo.deleteMany({user_id: userId}, function (err, photos) {
        if (err) {
            response.status(400).send(err);
            return;
        } 
        console.log("Deleting Photos, ", photos);
        //Deleted photos

        //Delete all commments and likes of the photos that remain
        let allPhotos = Photo.find({});
        allPhotos.select("user_id comments likes").exec(function (err, photosNew) {
            if (err) {
                console.error(err);
                response.status(400).send(err);
                return;
            } 
            console.log("PhotosNew,", photosNew);
            for (let i = 0; i < photosNew.length; i++) {
                for (let s = 0; s < photosNew[i].comments.length; s++) {
                    if (photosNew[i].comments[s].user_id.toString() === userId) {
                        photosNew[i].comments.splice(s, 1);
                        s--;
                    }
                }
                for (let t = 0; t < photosNew[i].likes.length; t++) {
                    if (photosNew[i].likes[t].toString() === userId) {
                        photosNew[i].likes.splice(t, 1);
                        t--;
                    }
                }
                photosNew[i].save();
            }

            //Delete all activities
            Feed.deleteMany({user_id: userId}, function (err, feeds) {
                if (err) {
                    response.status(400).send(err);
                    return;
                } 
                console.log("Deleting activities, ", feeds);
                //Delete User finally
                User.deleteOne({_id: userId}, function (err, user) {
                    if (err) {
                        response.status(400).send(err);
                        return;
                    }
                    console.log("user,", user);
                    request.session.destroy(function (err) { 
                        if (err) {
                            response.status(400).send(err);
                            return;
                        } else {
                            response.status(200).send("Completed Destruction");
                            return;
                        }
                    });
                });
                
            });
        });

    });
});

/*
 * URL /deletecomment/- delete an individual comment in a photo
 */
app.post('/deletecomment/', function(request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }

    let comment = request.body.commentA;
    let photoID = request.body.photoID;
    if (request.body.userID !== request.session.user_id) {
        response.status(401).send("Trying to delete not their photo");
        return;
    }
    console.log("photoID,", photoID);
    Photo.findOne({_id: photoID}, function (err, photo) {
        if (err) {
            response.status(500).send("Errenous Like Error");
            return;
        }
        for (let i = 0; i < photo.comments.length; i++) {
            if (photo.comments[i]._id.toString() === comment._id) {
                photo.comments.splice(i, 1);
                photo.save();
                //Delete comment
                let newActivity = new Feed;
                newActivity.photo_needed = true;
                newActivity.user_id = request.session.user_id;
                newActivity.date_time = new Date();
                newActivity.text = "deleted a comment";
                newActivity.file_name = photo.file_name;
                newActivity.save();
                response.status(200).send("Success");
                return;
            }
        }
        response.status(400).send("Can't find comment");
        return;  
    });

});

/*
 * URL /deletephoto/:id - delete a photo with 'id'
 */
app.post('/deletephoto/:id', function(request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }
    let photoId = request.params.id;
    let userID = request.body.userID;
    if (userID !== request.session.user_id) {
        response.status(401).send("Trying to delete not their photo");
        return;
    }
    Photo.deleteOne({_id: photoId}, function (err, photo) { 
        if (err || photo === undefined) {
            response.status(400).send(err);
            return;
        } 
        //Deleted
        let newActivity = new Feed;
        newActivity.photo_needed = false;
        newActivity.user_id = request.session.user_id;
        newActivity.date_time = new Date();
        newActivity.text = "deleted a photo";
        newActivity.file_name = "";
        newActivity.save();

        response.status(200).send("deleted photo");
        return;
    });
});

/*
 * URL /changelike/:id - change the like with 'id'
 */
app.post('/changelike/:id', function(request, response){
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }
    let photoId = request.params.id;
    let userID = request.body.userID;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            response.status(500).send("Errenous Like Error");
            return;
        }
        let index = photo.likes.indexOf(userID);
        if (index > -1) {
            //Unlike
            let newActivity = new Feed;
            newActivity.photo_needed = true;
            newActivity.user_id = request.session.user_id;
            newActivity.date_time = new Date();
            newActivity.text = "unliked a photo";
            newActivity.file_name = photo.file_name;
            newActivity.save();
            photo.likes.splice(index, 1);
            photo.save();
            response.status(200).send("Success");
            return;
        } else {
            //Like
            let newActivity = new Feed;
            newActivity.photo_needed = true;
            newActivity.user_id = request.session.user_id;
            newActivity.date_time = new Date();
            newActivity.text = "liked a photo";
            newActivity.file_name = photo.file_name;
            newActivity.save();
            photo.likes.push(userID);
            photo.save();
            response.status(200).send("Success");
            return;
        }
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Not logged in");
        return;
    }
    var id = request.params.id;
    let query = Photo.find({user_id: id});
    let copyPhotos = {};
    query.select("user_id comments file_name date_time likes");
    query.sort("date_time").exec(function (err, photos) {
        if (err) {
            console.error('Invalid userID', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        copyPhotos = JSON.parse(JSON.stringify(photos));
        async.each(copyPhotos, function(photo, done_callback) {
            async.each(photo.comments, function (comment, done_callbackInner) {
                let commentID = comment.user_id;
                delete comment.user_id;
                let queryIn = User.findOne({_id: commentID});
                queryIn.select("_id first_name last_name").exec (function (err, userInfo) {
                    if (err) {
                        response.status(400).send(JSON.stringify(err));
                        done_callbackInner(true);
                    }  
                    comment.user = userInfo;
                    done_callbackInner();
                });
            }, function(err) {
                done_callback(err);
            });
            
        }, function(err) {
            if (!err){ 
                response.status(200).send(JSON.stringify(copyPhotos));
                return;
            }
        });       
    });  
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
