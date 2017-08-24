/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
module.exports = {



  lupw: function(req,res){

    var pw = "3280";

    lupw = bcrypt.hashSync(pw, 10)

    return res.json({message:lupw});

  },

  getbyid: function(req,res){

    reqId = req.param('id');
    try {
      reqId = JSON.parse(reqId);
    }catch(e){}

    console.log(reqId);

    User.find({
      id:reqId
    }, function(err,user){
      if(err) return res.negotiate(err);
      if(!user){        
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
      }
      return res.json({user:user})      
    })

  },

  search: function(req, res){

    search = req.param('search');

    User.find({
      select:['id','name','firstname','email', 'type','createdAt'],
      or: [
        { name: {'contains': search}},
        { firstname: {'contains': search}},
        { email: {'contains': search}},
      ]
    }, function(err, users){
      if(err) res.negotiate(err);

      var usersTemp = [];

      for(var user of users){
        console.log({userType: user});
        if(user.type=="normal"){
          usersTemp.push(user);
        }
      }

      users = usersTemp;

      res.json(users);
    })

  },

  /**
   * `UserController.login()`
   */
  login: function (req, res) {

    if(req.param('email')!="" && req.param('password') != ""){

      var email = req.param('email'),
          password = req.param('password'),
          pushToken = req.param('push_token'),
          userFinal,
          msg,
          elts = [],
          bcr = [];

      User.find({email:email}).exec(function(err, user){
        
        if(err) return res.negotiate(err);        

        user.forEach(function(elt,i){


          if( bcrypt.compareSync(password, elt.password) ){

            userFinal = elt;
            elts.push(elt)

          }

        })


        if(userFinal){

          var token = jwt.sign({user: userFinal.id}, sails.config.jwtSecret, {expiresIn: sails.config.jwtExpires});


          User_Connected.find({user_id: userFinal.id}, function(err, usrCon){

            if(err)return res.negotiate(err);
            
            var usrCIds = [];
            
            if(usrCon.length>0){
              
              usrCon.forEach(function(usrC, i){
                usrCIds.push(usrC['user_id']);
              })

              console.log({usrCIds: usrCIds});

              User_Connected.destroy({user_id: usrCIds}, function(err){
                if(err) return res.negotiate(err);

                User_Connected.addNew({
                    user_id:userFinal.id,
                    user_token:token                     
                },function(err, userConnected){
                  if(err) return res.negotiate(err);
                  if(!userConnected){
                    return res.json({err:'invalid userConnected'});
                  }
                  return res.json({token:token});
                })

              })

            }else{

              User_Connected.addNew({
                  user_id:userFinal.id,
                  user_token:token                     
              },function(err, userConnected){
                if(err) return res.negotiate(err);
                if(!userConnected){
                  return res.json({err:'invalid userConnected'});
                }
                return res.json({token:token});
              })

            }

          })



        }else{

          if(user.length>0){
            msg = "Password invalid"
          }else{
            msg = "User not found"
          }

          res.json({error: msg});

        }
        
      })


    }else{
      return res.json({error:'no info'});
    }

  },


  /**
   * `UserController.logout()`
   */
  logout: function (req, res) {

    var token = req.header('authorization');

    // If there's nothing after "Bearer", just redirect to login
    if (!token) {return res.json({user:"user not connected"});}

    // If there is something, attempt to parse it as a JWT token
    return jwt.verify(token, sails.config.jwtSecret, function(err, payload) {

      // If there's an error verifying the token (e.g. it's invalid or expired),
      // redirect to the login page.
      if (err) {return res.json({user:"user not connected"});}
      
      // If there's no user ID in the token, redirect to login
      if (!payload.user) {return res.json({user:""});}
      // Otherwise try to look up that user
      User.findOne(payload.user, function(err, user) {
        if (err) {return res.negotiate(err);}
        // If the user can't be found, redirect to the login page
        if (!user) {return res.json({error:"user not connected"});}
        // Otherwise save the user object on the request (i.e. "log in") and continue


        // "Forget" the user from the session.
        // Subsequent requests from this user agent will NOT have `req.session.me`.
        req.session.me = null;

        User_Connected.logout({user_id:user['id']}, function(err){
          if(err) res.negotiate(err)

          console.log('userid: '+user['id']+' should be logged out');
          return res.json('user logged out');  

        })

      })

    })
  },


  /**
   * `UserController.signup()`
   */
  signup: function (req, res) {

    var firstName = "";
    if(req.param('firstname')) firstName = req.param('firstname');

    var user = {
          name: req.param('name'),
          firstname: req.param('firstname'),
          email: req.param('email'),
          password: req.param('password')
        }

    if(user.name!=""&&user.email!=""&&user.password!=""){

      User.find({email:user.email}, function(err,usr){

        if(err) return res.negotiate(err);
        if(usr.length>0){

          return res.json({formErr:"Email already used"});

        }else{

          var error = false,
              msgs = [];

          if( !functionsTool.isValidName(user.name) ){
            msgs.push('name too short or too long');
            error = true;
          } 
          if( !functionsTool.isValidEmail(user.email)  ){
            msgs.push('Email not valid')
            error = true;
          } 
          if( !functionsTool.isValidPassword(user.password) ){
            msgs.push('Password not valid');
            error = true;
          }    

          if(!error){

            User.signup({
              name: user.name,
              firstname: user.firstname,
              email: user.email,
              password: bcrypt.hashSync(user.password, 10)
            }, function(err, usrNew){
              
              if (err) return res.negotiate(err);
              var token = jwt.sign({user: usrNew.id}, sails.config.jwtSecret, {expiresIn: sails.config.jwtExpires});
              return res.json({token:token});

            })

          }else{
            return res.json({formErr: msgs});
          }

        }

      })


    }else{
    
      return res.json({err:"inputs missing"});

    }


    
  },



  getbytoken: function(req,res){

    // var token = req.header('authorization')-.split('Bearer ')[1];
    var token = req.header('authorization');

    // If there's nothing after "Bearer", just redirect to login
    if (!token) {return res.json({user:""});}

    // If there is something, attempt to parse it as a JWT token
    return jwt.verify(token, sails.config.jwtSecret, function(err, payload) {

      // If there's an error verifying the token (e.g. it's invalid or expired),
      // redirect to the login page.
      if (err) {return res.json({user:""});}
      
      // If there's no user ID in the token, redirect to login
      if (!payload.user) {return res.json({user:""});}
      // Otherwise try to look up that user
      User.findOne(payload.user, function(err, user) {
        if (err) {return res.negotiate(err);}
        // If the user can't be found, redirect to the login page
        if (!user) {return res.json({user:""});}
        // Otherwise save the user object on the request (i.e. "log in") and continue
        return res.json({user:user});
      });

    });

  },


  add: function (inputs, cb) {
    // Create a user
    User.create({
      name: "Makelo",
      email: "inputs.email@makelo.com",
      // TODO: But encrypt the password first
      password: "makelopw"
    })
    .exec(cb);
  }

};

