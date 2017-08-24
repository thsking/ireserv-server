var jwt = require('jsonwebtoken');

module.exports = {

	getall: function(req,res){


		Employee.getall(function(err, employee){
			if(err) return res.negotiate(err);
			if(!employee){
				if(req.wantsJSON){
					return res.json({error:'invalid'})
				}
				return res.json({message:'invalid'});
			}
			return res.json({employee:employee})
		})


	},


	getbyids: function(req,res){

		var userId= req.param('user_id');
		var entrepriseId = req.param('entreprise_id');

		Employee.getbyids({
			user_id: userId,
			entreprise_id: entrepriseId
		}, function(err,employee){

  		if(err) return res.negotiate(err);

  		if(!employee){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}

  		return res.json({employee:employee})			
		})

	},


	getbyid: function(req,res){

		var userId= req.param('user_id');

		Employee.getbyid({
			user_id: userId
		}, function(err,employee){

  		if(err) return res.negotiate(err);

  		if(!employee){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}

  		return res.json({employee:employee})			
		})

	},


	getbyentrepriseid: function(req,res){

		var entrepriseId = req.param('entreprise_id');

		Employee.getbyentrepriseid({
			entreprise_id: entrepriseId
		}, function(err,employee){

  		if(err) return res.negotiate(err);

  		if(!employee){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}

  		return res.json({employee:employee})			
		});

	},

	search:function(req,res){
		var reqSearchInput = req.param('search');

		Employee.search({
			searchinput: reqSearchInput
		}, function(err,employee){
  		if(err) return res.negotiate(err);
  		if(!employee){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}
  		return res.json({employee:employee})	
		})
	},


	updateschedule: function(req,res){
		var entreprise_id = req.param('entreprise_id'),
				employee_id = req.param('employee_id'),
				newSchedule = JSON.stringify( req.param('newschedule') ),
				com = [];


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
        if (!user) {return res.json({error:"user not connected"});}
        // Otherwise save the user object on the request (i.e. "log in") and continue


        // get employee info
        Employee.getbyids({
          user_id: user.id,
          entreprise_id: entreprise_id
        }, function(err, employee){

          if(err) return res.negotiate(err);
          if(!employee){       
            if (req.wantsJSON) {
              // return res.badRequest('Invalid username/password combination.');
              return res.json({error:"no employee"})
            }
            return res.json({error:'no employee'});
          }

          var employeeAuth = JSON.parse(employee.authorization);

          if(employeeAuth['employeeEdit']){


          	Employee.update({
							id: employee_id
						}, {
							schedule: newSchedule
						}).exec(function(err, employee){
							if (err) { return res.serverError(err); }
						})

						return res.json({employee:employee})

          }

        });

      })

    })


		
	},


	updateauthorization: function(req,res){
		var entreprise_id = req.param('entreprise_id'),
				employee_id = req.param('employee_id'),
				authorization = JSON.stringify( req.param('authorization') ),
				com = [];


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
        if (!user) {return res.json({error:"user not connected"});}
        // Otherwise save the user object on the request (i.e. "log in") and continue


        // get employee info
        Employee.getbyids({
          user_id: user.id,
          entreprise_id: entreprise_id
        }, function(err, employee){

          if(err) return res.negotiate(err);
          if(!employee){       
            if (req.wantsJSON) {
              // return res.badRequest('Invalid username/password combination.');
              return res.json({error:"no employee"})
            }
            return res.json({error:'no employee'});
          }

          var employeeAuth = JSON.parse(employee.authorization);

          if(employeeAuth['employeeEdit']){


          	Employee.update({
							id: employee_id
						}, {
							authorization: authorization
						}).exec(function(err, employee){
							if (err) { return res.serverError(err); }
						})

						return res.json({employee:employee})

          }else{
          	return res.json({error:"not authorized to edit employee"})
          }

        });

      })

    })


		
	}


}