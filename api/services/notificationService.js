vfirear jwt = require('jsonwebtoken');
var FCM = require('fcm-node');
var serverKey = "AAAAF3vpr6U:APA91bHWy-duNxKhHSZ6gr5xvSDdFEwR30zaP5jf-ZZ9Mr4_CO3xvsXNTGI2s5aBiUOUEEz_Cd-4403X5eEZj_i1Nx0DPTWglF5KBU_rBRg9kfIb9HMUiAXjI8fpD8BeqQMupZ_CWX2A";
var fcm = new FCM(serverKey);

module.exports = {

	checkForUnPushed: function(user_id, cb){
		
		var userId = user_id;


		Notification.find({ where: { user_id:userId, pushed: 0, seen: 0}, limit: 10, sort:'updatedAt DESC' }, function(err, notifs){
			
			if(err) res.negotiate(err);

			return cb({notifs:notifs});

		})

	},

	sendPush: function(params, cb){

		var pushToken = params.push_token,
				title = params.title,
				body = params.body,

				message = {
					to: pushToken,
					time_to_live: 10,

					notification: {
						title: title,
						body: body,
						sound:'default'
					},

				};

		fcm.send(message, function(err, resp){

			if(err){
				cb({err: err});
			}else{
				cb({msg:"sent"});
			}

		})

	},

	setToTrueNotificationsStatusForUserId(userId, cb){
		Notification.update({user_id:userId}, {pushed:'1'}, function(err){
			if(err){ cb({err:err});}
			else{
				console.log('errased should be done for user: '+
					userId);
				cb({done:'ok'});
			}

		})
	},

	transformNotificationToPushData(notif){

		var title	= '', 
				body 	= '',
				notifInfo = {
					customer_name: '',
					service_name: '',
					entreprise_name: ''
				};

		try {
			notifInfo = JSON.parse(notif.sub_infos);
		}catch(e){}

		if(notif.type=='appointment_new'){
			title = "Nouvelle demande de RDV - "+notif.id;
			body = notifInfo.service_name+", "+notifInfo.customer_name;

		}else if(notif.type=='appointment_accepted' ){
			title = "Demande de RDV acceptée - "+notif.id;
			body = notifInfo.service_name;

		}else if(notif.type=='appointment_refused'){
			title= "Demande de RDV refusé - "+notif.id;
			body = notifInfo.entreprise_name+", "+notifInfo.service_name;
		}

		return {
			title: title,
			body: body
		};

	},

	tryToPushNotificationToUserId(userId, notif, cb){


		var infos = notificationService.transformNotificationToPushData(notif);

		User_Connected.findOne({
			user_id:userId
		}, function(err, userC){
			if(err){cb({err:err})}
			else if(!userC){cb({err: 'user not connected <__></__>'})}
			else{

				if(userC.push_connected && userC.push_token.length > 0){

					notificationService.sendPush({
						push_token:userC.push_token, 
						title: infos.title,
						body: infos.body
					}, function(result){

						if(result.err){
							console.log('xx error sent push')
							cb({err:result.err})
						}else if(result.msg){

							console.log('push sent');

							Notification.update({id:notif.id},{pushed:1}, function(err){
								if(err){cb({err:'notif sent but not edited'})}
								else{
									cb({msg:'sent'});
								}
							})

						}
					})

				}else{
					console.log('xx user not connected to push');
					console.log({userC:userC})
					cb({err:'user not connected'})
				}
			}
		})

	}

}