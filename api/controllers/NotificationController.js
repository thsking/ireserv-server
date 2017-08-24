var jwt = require('jsonwebtoken');
var FCM = require('fcm-node');
var serverKey = "AAAAF3vpr6U:APA91bHWy-duNxKhHSZ6gr5xvSDdFEwR30zaP5jf-ZZ9Mr4_CO3xvsXNTGI2s5aBiUOUEEz_Cd-4403X5eEZj_i1Nx0DPTWglF5KBU_rBRg9kfIb9HMUiAXjI8fpD8BeqQMupZ_CWX2A";
var fcm = new FCM(serverKey);

module.exports = {

  pushit: function(req,res){

    
      var registrationToken = req.param('registration_token') ;

      notificationService.sendPush({
        push_token: registrationToken,
        title: "Un titre X",
        body: 'Du text'
      }, function(pushResult){

        console.log({pushResult:pushResult});

        if(pushResult.err){
          return res.negotiate(pushResult.err);
          // return res.json({err: "error hp"});

        }else if(pushResult.msg){
          return res.json({msg:'sent'});
        }

      })  

  },
	
	getall: function(req, res){

		Notification.getall(function(err, notification){
			if(err) return res.negotiate(err);
			if(!notification){
				if(req.wantsJSON){
					return res.json({error:'invalid'})
				}
				return res.json({message:'invalid'});
			}
			return res.json({notification:notification})
		})

	},

	getByUserId: function(req, res){

		var userId = req.param('user_id');

		var token = req.header('authorization');

		// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE0OTM5ODExMTMsImV4cCI6MTQ5NDA2NzUxM30.YjqMrE-PYHWc-4rtm4TxvQs-5Ja9D2PoE-1ryOEkL0U";

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


        if(parseInt(user.id) == parseInt(userId)){

        	Notification.find({
            where: { user_id: userId },
            sort: 'id DESC'
        	}).exec(function(err, notif){

        		if(err){res.json({err:err})}

        		res.json(notif);

        	})

        }else{

        	return res.json({err: 'not the good user', user: user.id, userId: userId});

        }

      })

    })

	},

  seen: function(req, res){

    var notifId = req.param('notification_id');

    var token = req.header('authorization');

    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE0OTQyNTA2NjEsImV4cCI6MTQ5NDMzNzA2MX0.aqaCMh8-5cwd5Ji84NuIcX_d3G0654d5apszpK955bM";

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

        Notification.update({user_id: user.id, id: notifId}, {seen:1}).exec(function(err, notif){

          if(err){res.json({err:err})}            

          res.json(notif)

        })

      })

    })

  }
}