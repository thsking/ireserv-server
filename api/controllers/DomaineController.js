module.exports = {
	
	getall: function(req, res){

		Domaine.getall(function(err, domaine){
			if(err) return res.negotiate(err);
			if(!domaine){
				if(req.wantsJSON){
					return res.json({error:'invalid'})
				}
				return res.json({message:'invalid'});
			}
			return res.json({domaine:domaine})
		})

	}
	
}