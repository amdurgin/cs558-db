cs558-db
========

This module exposes a constructor to the ClassDB object, which handles all 
of the reading/writing entries in the db. It is built ontop of level.

Usage: 
'''javascript
var classdb = require("cs558-db");

//create new ClassDB instance
var db = new classdb(pathToDataBase);

//add a new student to the database with name "name", "password", and a 
//callback function that is called after the student database operations.
//callback will be called with at most one argument -- an error string.
db.addNewStudent("name", "password", function(err){
  if(err){
    //failed to add student to database
  }else{
    //successfully added student to database
  }
});

//Store student submission sources for each attempt. The callback function 
//is called with at most one argument -- an error string. Src should be a 
//Buffer. It is similar usage for putAssignmentScore. 
db.putAssignmentSrc("name", "password", assignmentNum, src, function(err){
  if(err){
    //error storing src
  }else{
    //successfully store src
  }
});

//Similarly we can use db to acccess assignment scores and sources, with
//db.getAssignmentScore and db.getAssignmentSrc respectively. Takes a 
//call back as argument, and will be passed an error string as the first 
//argument if there is an error, otherwise the second argument passed will be
//the score(or source for getAssignmentSrc). db.getMaxAssignmentScore is
//similar but doesn't take an attempt argument.
db.getAssignmentScore("name", "password", "attempt", function(err, val){
  if(err){
    //error getting score
  }else{
    //score is read and passed as val
  }
});

//db.verifyStudent takes a name, password and callback and verifies the 
//the password name combination, and passes an error to callback if there 
//is an error. 
db.verifyStudent("name", "password", function(err){
  if(err){
    //error, maybe non existent student or bad password
  }else{
    //Student identity is verified.
  }
});
'''
