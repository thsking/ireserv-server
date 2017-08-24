var jwt = require('jsonwebtoken');
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

	create: function(req, res){

		var description = req.param('description');
				location = req.param('location');

		var token = req.header('authorization');

    // If there's nothing after "Bearer", just redirect to login
    if (!token) {return res.json({user:"user not connected"});}

    // If there is something, attempt to parse it as a JWT token
    return jwt.verify(token, sails.config.jwtSecret, function(err, payload) {

      // If there's an error verifying the token (e.g. it's invalid or expired),
      // redirect to the login page.
      if (err) {return res.json({user:"user not connected"});}
      
      // If there's no user ID in the token, redirect to login
      if (!payload.user) {return res.json({user:""});}
      // Otherwise try to look up that user
      User.findOne(payload.user, function(err, user) {
        if (err) {return res.negotiate(err);}
        // If the user can't be found, redirect to the login page
        if (!user) {return res.json({user:"user not connected"});}
        // Otherwise save the user object on the request (i.e. "log in") and continue


				if(location && description){


					Bugsreport.create({
						user_id:user.id,
						user_ip: 0,
						bug_location: location,
						bug_description: description
					}).exec(function(err, br){
						res.json({bugCreated:br})
					})

				}
        
      })		

   	})


		/*Bugsreport.create({

		})*/

	}

}