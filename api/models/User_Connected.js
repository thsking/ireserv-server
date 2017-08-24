module.exports = {
	
	attributes: {
		id: {
			type:'integer',
	    primaryKey: true,
	    autoIncrement: true
	  },
		user_id: {type:'integer'},
		user_token: {type:'string'},
		push_connected: {type:'integer'},
		push_token: {
			type:'string',
    	defaultsTo : ''
		},
		createdAt: {type: 'datetime'} ,
		updatedAt: {type: 'date'} 
	},


	logout: function(params, cb){

		var userId = params.user_id;

		User_Connected.destroy({user_id: userId}).exec(cb);

	},

	addNew: function(params, cb){
		var token = params.user_token,
				userId = params.user_id;

		User_Connected.create({
			user_id: userId,
			user_token: token,
			push_connected: 0,
			push_token: '',
		}).exec(cb);

	}

}