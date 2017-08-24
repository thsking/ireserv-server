module.exports = {
	
	attributes: {

		id: {
			type: 'integer',
	    primaryKey: true,
	    autoIncrement: true
	  },
		domaine_id: {type: 'integer'} ,
		category_id: {type: 'integer'},
		administrator_id: {type: 'integer'},
		name: {type: 'string'},
		location: {
			type: 'string',
    	defaultsTo : ''
    },
		description: {
			type: 'string',
    	defaultsTo : ''
    },
		services_favorits: {
			type: 'string',
    	defaultsTo : '[]'
    },
		contact_person: {
			type: 'string',
    	defaultsTo : ''
    },
		phone_number: {
			type: 'string',
    	defaultsTo : ''
    },
		createdAt: {type: 'date'},
		updatedAt: {type: 'date'} 

	},

	getall: function(cb){
		Entreprise.find().exec(cb)
	},

	getbydomcatid: function(inputs, cb){
		Entreprise.find({
			domaine_id: inputs.domaine_id,
			category_id: inputs.category_id
		})
		.exec(cb)
	},

	getbyid:function(inputs,cb){
		Entreprise.find({
			id: inputs.id
		}).exec(cb)
	},

	search:function(inputs, cb){
		Entreprise.find({
			name: {
        'contains': inputs.searchinput
    	}
		}).exec(cb)
	}

}