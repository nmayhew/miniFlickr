"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Feed
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a feed schema
var feedSchema = new mongoose.Schema({
    photo_needed: Boolean, // Type of activity.
    user_id: mongoose.Schema.Types.ObjectId,  // user ID of activity author.
    date_time: {type: Date, default: Date.now}, // The date and time when the activity was created.
    text: String,    // If text should be included
    file_name: String,    // File name if photo.
    
});

// the schema is useless so far
// we need to create a model using it
var Feed = mongoose.model('Feed', feedSchema);

// make this available to our users in our Node applications
module.exports = Feed;
