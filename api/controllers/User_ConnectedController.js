var jwt = require('jsonwebtoken');
module.exports = {


	getusers: function(req,res){


		User_Connected.find({}, function(err, users){
			if(err) return res.negotiate(err);
			if(!users){
				return res.json({err: 'users not founds or error happend'});
			}

			res.json({users:users});			

		})


	},

	pushlogin: function(req, res){

		var pushToken = req.param('push_token'),
    		token = req.header('authorization');

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

        	console.log(user.name+" just connect");

					User_Connected.find({
						user_id: user.id
					}, function(err, userConnected){
						
						if(err) res.negotiate(err);

						User_Connected.findOrCreate({
							user_id:user.id
						},{
							user_id: user.id,
							user_token: token,
							push_connected: 1,
							push_token: pushToken
						}).exec(function(err, focUser){
							if(err) return res.negotiate(err);

							console.log(user.name+" should be push connected with token");
							console.log(pushToken);

							User_Connected.update({user_id:user.id},
							{
								user_token: token,
								push_connected: 1,
								push_token: pushToken								
							}).exec(function(err){

								if(err) return res.negotiate(err);

								notificationService.checkForUnPushed(user.id, function(notifs){

									if(notifs.notifs && notifs.notifs.length>0){

										var notifs = notifs.notifs,
												i = 0,
												tooMuchSent = false;

										if(notifs.length<5){

											var loopArray = function(arr){

													
												if(i < 5){

													var infos = notificationService.transformNotificationToPushData(arr[i]);

													notificationService.sendPush({
														push_token: pushToken,
														title: infos.title,
														body: infos.body
													}, function(){

														console.log('sb notifyed')

														i++;

														if( i < notifs.length){
															loopArray(arr);
														}else{

															notificationService.setToTrueNotificationsStatusForUserId(user.id, function(cleanerBack){

												        if(cleanerBack.err){
												          return res.negotiate(cleanerBack.err);
												          // return res.json({err: "error hp"});

												        }else if(cleanerBack.done){
												          return res.json({errased:'done'});
												        }

															})
														}


													})

												}

											}

											loopArray(notifs);

										}else{


											notificationService.sendPush({
												push_token: pushToken,
												title: "Plusieurs notifications en attentes.",
												body: "Vous avez plus de 5 notifications en attentes."
											}, function(){

												console.log('too many pushed to send then only 5 + warning sent.')
												tooMuchSent=true;

												notificationService.setToTrueNotificationsStatusForUserId(user.id, function(cleanerBack){

													console.log({cleanerBack:cleanerBack})
									        if(cleanerBack.err){
									          return res.negotiate(cleanerBack.err);
									          // return res.json({err: "error hp"});

									        }else if(cleanerBack.done){
									          return res.json({errased:'done'});
									        }

												})

											})

										}

									}

								})

							})


						})

					})

      })

    })

	}

};

