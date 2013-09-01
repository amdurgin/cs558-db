var level = require("level");
var pwd   = require("pwd-base64");

var ClassDB = function(path){
  if(typeof path !== "undefined")
    this.path = path + "/CLASSDB";
  else
  this.path = "./CLASSDB";
  this.db = level(this.path);
  this.getAssignmentAttempts = getAssignmentAttempts;
  this.getMaxAssignmentScore = getMaxAssignmentScore;
  this.getAssignmentSrc = getAssignmentSrc;
  this.getAssignmentScore = getAssignmentScore;
  this.putAssignmentSrc = putAssignmentSrc;
  this.putAssignmentScore = putAssignmentScore;
  this.addNewStudent = addNewStudent;
  this.verifyStudent = verifyStudent;
}

//TODO: add another field for number of attempts
var getAssignmentSrc = function(name, password, assignmentNum, attempt, callback){
  var db = this.db;
  var cb = function(err){ 
    if(typeof err === "undefined"){
      db.get(name + "Assignment" + assignmentNum + "Src" + "Attempt" + attempt,
        function(err, val){
          if(err){
            console.log(err); 
            callback(err)
          }else{
            callback(err,val)
          }
      });
    }else{
      callback(err);
    }
  }
  this.verifyStudent(name, password, cb); 
}

var getAssignmentScore = function(name, password, assignmentNum, attempt, callback){
  var db = this.db;
  var cb = function(err){
    if(typeof err === "undefined"){
      db.get(name + "Assignment" + assignmentNum + "Score" + "Attempt" + attempt,
        function(err, val){
          if(err){
            console.log(err); 
            callback(err)
          }else{
            callback(err, val)
          }
      });
    }else{
      callback(err);
    }
  }
  this.verifyStudent(name, password, cb);
}

//If it doesnt exist, this value for the key-value pair is made and initilized to 0
var getAssignmentAttempts = function(name, password, assignmentNum, callback){
  var db = this.db;
  var cb = function(err){
    if(err){
      console.log(err);
      callback(err);
    }else{
      db.get(name + "Assignment" + assignmentNum + "AttemptNum",
        function(err, val){
          if(err){
            if(err.name.localeCompare("NotFoundError") == 0){ //key doesnt exist
              db.put(name + "Assignment" + assignmentNum + "AttemptNum", 0, function(err){
                if(err){
                  console.log(err);
                  callback(err);
                }else{
                  callback(null, 0); 
                }
              });
            }else{
              console.log(err);
              callback(err);
            }
          }else{
            callback(null, val)
          }
        });
    }
  }
  this.verifyStudent(name, password, cb);
}

var getMaxAssignmentScore = function(name, password, assignmentNum, callback){
  var db = this.db;
  var cb = function(err){
    if(typeof err === "undefined"){
      db.get(name + "Assignment" + assignmentNum + "Score", function(err, val){
          if(err){
            console.log(err); 
            callback(err)
          }else{
            callback(err, val)
          }
      });
    }else{
      callback(err);
    }
  }
  this.verifyStudent(name, password, cb);
}

//check for attempt # for assignmentNum, if field doesnt exist, create it, if
// it does, add one to it and, but it really shouldnt be handled here... 
var putAssignmentSrc = function(name, password, assignmentNum, src, callback){
  var db = this.db;
  var cb = function(err){
    if(typeof err === "undefined"){ 
      db.get(name + "Assignment" + assignmentNum + "AttemptNum", function(err, val){
        if(err){//doesnt exist, so must be first attempt
          db.put(name + "Assignment" + assignmentNum + "AttemptNum", 1, function(err){//swap these
            db.put(name + "Assignment" + assignmentNum + "SrcAttempt1", src, //two functions' orders?
              function(err){
                if(err){
                  console.log(err); 
                  callback(err);
                }else{
                  callback();
                }
            });//end put  
          });//end put
        }else{//exists, so this attempt is attemptNum + 1
          db.put(name + "Assignment" + assignmentNum + "SrcAttempt" + Number(val+1), src, function(err){
            if(err){
              console.log(err);
              callback.log(err);
            }else{//successfully put score, so change attemptnum ++
              db.put(name + "Assignment" + assignmentNum + "AttemptNum", +val + 1, function(err){
                if(err){
                  console.log(err);
                  callback(err);
                }else{
                  callback();
                }
              });
            }
          });
        }
      });//get assignment attempt#
    }else{
      callback(err);
    }
  }
  this.verifyStudent(name, password, cb);
}

//put assignment score is always called only after src is actually stored in db
//so no need to check for change in attemptnum, etc. May possibly change maxscore
var putAssignmentScore = function(name, password, assignmentNum, score, callback){ 
  var db = this.db;
  var cb = function(err){
    if(err){
      console.log(err);
      cb(err);
    }else{
      db.get(name + "Assignment" + assignmentNum + "AttemptNum", function(err, val){
        if(err){
          console.log(err);
          callback(err);
        }else{
          db.put(name + "Assignment" + assignmentNum + "ScoreAttempt" + val, score,
            function(err){
              if(err){
                console.log(err); 
                callback(err)
              }else{ //put score for attempt val, now time to change maxscore maybe
                db.get(name + "Assignment" + assignmentNum + "Score", function(err, max){
                  if(err){//doesnt exist
                      console.log("Max score doesnt exist yet. Making one");
                      db.put(name + "Assignment" + assignmentNum + "Score", score, function(err){
                        if(err){
                          console.log(err);
                          callback(err);
                        }else{
                          callback();
                        }
                      });
                  }else{
                    if(score > max){
                      console.log("Changing max score!");
                      db.put(name + "Assignment" + assignmentNum + "Score", score, function(err){
                        if(err){
                          console.log(err);
                          callback(err);
                        }else{
                          callback();
                        }
                      });
                    }else{
                      callback();
                    }
                  }
                });
              }
          });
        }
      });
    }
  }//end cb def
  this.verifyStudent(name, password, cb);
}

//pbkdf2 base-64 string hash
var addNewStudent = function(name, password, callback){
  var db = this.db;
  pwd.hash(password, 
    function(err, salt, hash){
      if(err){
        console.log("Error: " + err);
        callback(err);
      }else{
        db.put(name + "Salt", salt,
          function(err){
            if(err){
              console.log(error)
            }else{
              console.log("finished adding student salt")
            }
        });
        
        db.put(name + "Hash", hash,
          function(err){
            if(err){
              console.log(error)
            }else{
              console.log("finished adding student hash")
            }
        });
        callback();
      }
  });
}

var verifyStudent = function(name, password, callback){
  var db = this.db;
  db.get(name + "Salt", function(err, salt){
      if(err){
        console.log("Error:" + err)
      }else{
        db.get(name + "Hash", function(err, hash){
            if(err){
              console.log(err)
            }else{
              pwd.hash(password, salt, function(err, realHash){
                  if(err){
                    console.log(err);
                    callback("Error: Bad Username or Password");
                  }else{
                    if( (typeof hash !== "undefined") && (typeof realHash !== "undefined") ){
                      if(hash == realHash)
                        callback();
                      else{
                        console.log("Error: Bad Username or Password");
                        callback("Error: Bad Username or Password");
                      }
                    }else{
                      console.log("Error: Bad Username or Password");
                      callback("Error: Bad Username or Password");
                    }
                  }
              });
            }
        });
      }
  });
}


module.exports = ClassDB;

