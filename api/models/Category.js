module.exports = {
	
	attributes: {
		id: {type:'integer'},
		domaine_id: {type: 'integer'},
		name: {type:'string'},
		icon: {type:'string'},
		createdAt: {type: 'date'} ,
		updatedAt: {type: 'date'} 
	},

	getall: function(cb){
		Category.find().exec(cb)
	},

  getbydomaineid: function (inputs, cb) {
    Category.find({
      domaine_id: inputs.domaine_id
    })
    .exec(cb);
  },

}