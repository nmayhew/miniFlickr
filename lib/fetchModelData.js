var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/

function fetchModel(url) {
  return new Promise(function(resolve, reject) {
    let requ = new XMLHttpRequest();
    requ.open("GET", url);
    requ.onreadystatechange = function() {
      if (requ.readyState === 4) {
        if(requ.status >= 200 && requ.status < 300) {
          resolve({data: JSON.parse(requ.response)});
        } else {
          reject({status: requ.status, statusText: requ.statusText});
        }
      }
    } 
    requ.send(); 
  });
}

export default fetchModel;