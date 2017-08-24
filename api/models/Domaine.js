module.exports = {
	
	attributes: {
		id: {type:'integer'},
		name: {type:'string'},
		icon: {type:'string'},
		createdAt: {type: 'date'} ,
		updatedAt: {type: 'date'} 
	},

	getall: function(cb){
		Domaine.find().exec(cb)
	},

}