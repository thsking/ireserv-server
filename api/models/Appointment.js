module.exports = {
	
	attributes: {

		id: {type: 'integer',
	    primaryKey: true,
	    autoIncrement: true
	  },
		entreprise_id: {
			type: 'integer',
    	defaultsTo : 0
		} ,
		employee_id: {type: 'integer'} ,
		customer_id: {type: 'integer'} ,
		service_id: {type: 'integer'} ,
		status: {type: 'integer'},
		date: {type: 'string'},
		hour: {type: 'string'},
		timestamp: {type: 'date'},
		duration: {type: 'integer'},
		break_time: {type: 'integer'},
		location: {type: 'string'},
		description: {type: 'string'},
		contact_number: {type: 'string'},
		customer: {
			type: 'string',
			defaultsTo: ''
		},
		createdAt: {type: 'date'},
		updatedAt: {type: 'date'} 

	},

	getbyidsdate: function(inputs, cb){
		Appointment.find({
			entreprise_id: inputs.entreprise_id,
			employee_id: inputs.employee_id,	
			date: {
				'startsWith': inputs.date
			}
		}).exec(cb)
	}

	/*getbyids:function(inputs,cb){
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
	}*/

}