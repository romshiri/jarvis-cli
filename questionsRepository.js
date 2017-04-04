var firebase = require('firebase-admin');
var config = require('./config');

firebase.initializeApp({
  credential: firebase.credential.cert(config.get('firebase:serviceAccount')),
  databaseURL: config.get('firebase:databaseURL')
});

var db = firebase.database();
var ref = db.ref('/');

exports.getTopics = function(callback) {
  ref.on('value', function(snapshot) {
    callback(null, snapshot.val());
  }, function (errorObject) {
    callback(new Error('The read failed: ' + errorObject.code));
  });
};