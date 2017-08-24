module.exports = {
	
	attributes: {
		id: {
			type:'integer',
	    primaryKey: true,
	    autoIncrement: true
		},
		user_id: {type:'integer'},
		entreprise_id: {type: 'integer'},
		type: {type: 'string'},
		sub_infos: {type:'string'},
		seen: {type:'integer'},
		pushed: {type: 'integer'},
		createdAt: {type: 'date'} ,
		updatedAt: {type: 'date'} 
	},

	getall: function(cb){
		Notification.find().exec(cb)
	},

}