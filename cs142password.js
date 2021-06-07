const crypto = require('crypto');
const hashAlgoType = 'sha1';
const out = 'hex';
/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 */
function makePasswordEntry(clearTextPassword) {
    let hash = crypto.createHash(hashAlgoType);
    let buf = crypto.randomBytes(8);
    let newPass = clearTextPassword + buf.toString(out);
    let passwordObj = {};
    passwordObj.salt = buf.toString(out);
    passwordObj.hash = hash.update(newPass).digest(out);
    return passwordObj;
}


/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    let hashAlgo = crypto.createHash(hashAlgoType);
    let newPass = clearTextPassword + salt;
    let digest = hashAlgo.update(newPass).digest(out);
    if (digest === hash) {
        return true;
    } else {
        return false;
    }
}
exports.doesPasswordMatch = doesPasswordMatch;
exports.makePasswordEntry = makePasswordEntry;