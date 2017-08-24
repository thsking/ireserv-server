module.exports = {
	
	attributes: {

		id: {
			type: 'integer',
	    primaryKey: true,
	    autoIncrement: true
		},
		entreprise_id: {type: 'integer'} ,
		user_id: {type: 'integer'} ,
		authorization: {type: 'string'},
		schedule: {type: 'string'},
		createdAt: {type: 'date'},
		updatedAt: {type: 'date'} 

	},


	getbyids:function(inputs,cb){
		Employee.findOne({
			user_id: inputs.user_id,
			entreprise_id: inputs.entreprise_id
		}).exec(cb)
	},

	getbyid:function(inputs,cb){
		Employee.find({
			user_id: inputs.user_id,
		}).exec(cb)
	},

	getbyentrepriseid: function(inputs,cb){
		Employee.find({
			entreprise_id:inputs.entreprise_id
		}).exec(cb)
	},

	search:function(inputs, cb){
		Employee.find({
			name: {
        'startsWith': inputs.searchinput
    	}
		}).exec(cb)
	}

}