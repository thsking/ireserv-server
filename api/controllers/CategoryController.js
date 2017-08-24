module.exports = {
	
	getall: function(req, res){

		Category.getall(function(err, category){
			if(err) return res.negotiate(err);
			if(!category){
				if(req.wantsJSON){
					return res.json({error:'invalid'})
				}
				return res.json({message:'invalid'});
			}
			return res.json({category:category})
		})

	},

	getbydomaineid: function(req, res){

		var reqid = req.param('id');

  	Category.getbydomaineid({
  		domaine_id: reqid
  	}, function(err, category){
  		if(err) return res.negotiate(err);
  		if(!category){  			
        if (req.wantsJSON) {
          // return res.badRequest('Invalid username/password combination.');
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}
  		return res.json({category:category})
  	})

	}

}