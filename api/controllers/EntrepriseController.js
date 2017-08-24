var jwt = require('jsonwebtoken');
module.exports = {

	getjwt: function(req,res){

		res.json({w:sails.config.jwtSecret});

	},

	getall: function(req,res){

		Entreprise.getall(function(err, entreprise){
			if(err) return res.negotiate(err);
			if(!entreprise){
				if(req.wantsJSON){
					return res.json({error:'invalid'})
				}
				return res.json({message:'invalid'});
			}
			return res.json({entreprise:entreprise})
		})


	},


	getbydomcatid: function(req,res){

		var domId = req.param('domaine_id'),
				catId = req.param('category_id');

		Entreprise.getbydomcatid({
			domaine_id:domId,
			category_id:catId
		}, function(err,entreprise){
  		if(err) return res.negotiate(err);
  		if(!entreprise){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}
  		return res.json({entreprise:entreprise})			
		})

	},


	getbyid: function(req,res){
		var reqId = req.param('id');

		try {
			reqId = JSON.parse(reqId);
		}catch(e){}

		console.log({reqId: reqId});

		Entreprise.getbyid({
			id:reqId
		}, function(err,entreprise){
  		if(err) return res.negotiate(err);
  		if(!entreprise){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}

  		var i = 0; 

  		for(var key in entreprise){
  			if(entreprise.hasOwnProperty(key)) i++;
  		}

  		if(i==1){
  			entreprise = entreprise[0];
  		}

  		return res.json({entreprise:entreprise})			
		})



	},

	search:function(req,res){
		var reqSearchInput = req.param('search');

		Entreprise.search({
			searchinput: reqSearchInput
		}, function(err,entreprise){
  		if(err) return res.negotiate(err);
  		if(!entreprise){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}
  		return res.json({entreprise:entreprise})	
		})

	},

	addemployee: function(req, res){

		var entrepriseId = req.param('entreprise_id'),
				userId = req.param('user_id'),
				token = req.header('authorization');

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


        Employee.findOne({entreprise_id: entrepriseId, user_id: user.id}).exec(function(err, employee){

					if(err){res.negotiate(err)}

					if(employee.authorization){
						employee.authorization = JSON.parse(employee.authorization);
					}else{
						res.json({err:'Employee have no authorization to add new user'});
					}

					if(employee.authorization.employeeAdd){

						Employee.find({entreprise_id:entrepriseId, user_id:userId }, function(err, emp){
							if(err) res.negotiate(err)
							if(emp.length==0){
								
								Employee.create({
									entreprise_id: entrepriseId,
									user_id: userId,
									authorization: JSON.stringify(getDefault.authorization()),
									schedule: JSON.stringify(getDefault.schedule()),									
								}, function(err, newEmployee){
									if(err) res.negotiate(err)
									res.json({newEmployee: newEmployee});
								})

							}else{
								res.json({err:"This employee already works for this entreprise", em: emp});
							}
						})
		

					}

				})


      })

    })



	},

	createemployee:function(req, res){

		var entrepriseId = req.param('entreprise_id'),
				empl = {
					surname: req.param('surname'),
					firstname: req.param('firstname'),
					email: req.param('email'),
					email_confirmation: req.param('email_confirmation'),
					password: req.param('password'),
					futur_user: req.param('futur_user')
				},
				token = req.header('authorization');

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


				if(!empl.futur_user){
					empl.email = '';
					empl.email_confirmation = '';
					empl.password = '';
					empl.type = 'bot'
				}else{
					empl.type = 'temporary'
				}

				Employee.find({entreprise_id: entrepriseId, user_id: user.id}).exec(function(err, employee){

					if(err){res.json(err)}

					employee = employee[0];

					if(employee.authorization){
						employee.authorization = JSON.parse(employee.authorization);
					}

					if(employee.authorization.employeeAdd){

						if(empl.futur_user){

							User.find({email: empl.email}).exec(function(err, usr){

								if(err){res.json({err:err})};

								if( usr.length > 0 ){
									res.json({err: 'email already exist'});
								}else{

									User.create({
										name: empl.surname,
										firstname: empl.firstname,
										email: empl.email,
										password: empl.password,
										type: empl.type
									}).exec(function(err, newUser){

										if(err){res.json({err:err})}

										Employee.create({
											entreprise_id: entrepriseId,
											user_id: newUser.id,
											authorization: "",
											schedule: ""
										}).exec(function(err, newEmployee){
											if(err){ res.json({err:err})}
											res.json({success:'employee and user created', user: newUser, employee: newEmployee});
										})

									})

								}

							})

						}else{

							User.create({
								name: empl.surname,
								firstname: empl.firstname,
								email: '',
								password: '',
								type: empl.type
							}).exec(function(err, newUser){
								
								if(err){res.json({err:err})}

								Employee.create({
									entreprise_id: entrepriseId,
									user_id: newUser.id,
									authorization: '',
									schedule: ''
								}).exec(function(err, newEmployee){
									if(err){ res.json({err:err})}
									res.json({success:'employee and user created', user: newUser, employee: newEmployee});
								})

							})
							
						}

					}else{
						res.json('you aint got the authorization little');
					}
					

				})


      })

    })

	},

	create: function(req, res){

		var form = {
			name: req.param('name'),
			domaine: req.param('domaine'),
			category: req.param('category'),
			contact_person: req.param('contact_person'),
			phone_number: req.param('phone_number'),
			location: req.param('location'),
			description: req.param('description')
		}

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


		  	if(form.name == '' || form.domaine == '' || form.category == ''){
		  		res.json({err: 'empty required inputs'})
		  	}

		  	Entreprise.create({
		  		domaine_id: form.domaine,
		  		category_id: form.category,
		  		administrator_id: user.id,
		  		name: form.name,
		  		location: form.location,
		  		description: form.description,
		  		contact_person: form.contact_person,
		  		phone_number: form.phone_number
		  	}).exec(function(err, newEntreprise){

		  		if(err){ return res.negotiate({err:err}) }


		  		var auth = {"appointementSelf":true,"appointmentSelfService":true,"appointmentAll":true,"employeeAdd":true,"employeeEdit":true,"employeeRemove":true,"employeeSetService":true,"employeeRemoveService":true,"serviceCreate":true,"serviceEdit":true,"general_info":true};

		  		auth = JSON.stringify(auth);

		  		Employee.create({
		  			entreprise_id: newEntreprise.id,
		  			user_id: user.id,
		  			authorization: auth,
		  			schedule: ""

		  		}).exec(function(err, newEmployee){

		  			if(err){return res.serverError(err)};

		  			return res.json({newEntreprise:newEntreprise, newEmployee:newEmployee});

		  		})

		  	})



      })

    })

		

	},


	saveservicesfavorits:function(req,res){

		var entrepriseId = req.param('entreprise_id'),
				ids = req.param('ids'),
				token = req.header('authorization');

		try {
			ids = JSON.stringify(ids);
		}catch(e){
			ids = "[]";
		}


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

        Employee.findOne({
        	entreprise_id: entrepriseId,
        	user_id: user.id
        }, function(err, employee){

					if (err) {return res.negotiate(err);}
					if (!user) {return res.json({error:"no employee found"});}


					try {

						employee.authorization = JSON.parse(employee.authorization);
						

						if(employee.authorization.general_info){

							Entreprise.update({
								id: entrepriseId
							},{
								services_favorits: ids
							}).exec(function(err, entreprise){
								if (err) {return res.negotiate(err);}
								if (!entreprise) {return res.json({error:"no employee found"});}

								return res.json({etp:entreprise})

							})

						}else{
							return res.json({error: "employee have not the privilege"});
						}

					}catch(e){
						return res.json({error: "employee have not the privilege + parse error"});
					}

        })

      })

    })

	},


	updateinfos: function(req, res){

		var entrepriseId = req.param('entreprise_id'),
				name = req.param('name'),
				location = req.param('location'),
				description = req.param('description'),
				contact_person = req.param('contact_person'),
				phone_number = req.param('phone_number'),
				token = req.header('authorization');


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

        Employee.findOne({
        	entreprise_id: entrepriseId,
        	user_id: user.id
        }, function(err, employee){

					if (err) {return res.negotiate(err);}
					if (!user) {return res.json({error:"no employee found"});}


					try {

						employee.authorization = JSON.parse(employee.authorization);					


					}catch(e){
						return res.json({error: "Parse error", e:e});
					}

					
					if(employee.authorization.general_info){

						Entreprise.update({
							id: entrepriseId
						},{
							name: name,
							location: location,
							description: description,
							contact_person: contact_person,
							phone_number: phone_number
						}).exec(function(err, entreprise){
							if (err) {return res.negotiate(err);}
							if (!entreprise) {return res.json({error:"no employee found"});}

							return res.json({etp:entreprise})

						})

					}else{
						return res.json({error: "employee have not the privilege", empl: employee});
					}


        })

      })

    })

	},


	remove:function(req, res){
		
		var entrepriseId = req.param('entreprise_id'),
				token = req.header('authorization');

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

        Employee.findOne({
        	entreprise_id: entrepriseId,
        	user_id: user.id
        }, function(err, employeez){

					if (err) {return res.negotiate(err);}
					if (!user) {return res.json({error:"no employeez found"});}


					try {

						employeez.authorization = JSON.parse(employeez.authorization);					


					}catch(e){
						return res.json({error: "Parse error", e:e});
					}

					
					if(employeez.authorization.general_info){

							
						
						Entreprise.destroy({
							id: entrepriseId
						}, function(err){
							if(err){return res.negotiate(err)}

								Employee.destroy({
									entreprise_id: entrepriseId
								}, function(err){
									if(err){return res.negotiate(err)}

									Appointment.destroy({
										entreprise_id: entrepriseId
									}, function(err){
										if(err){return res.negotiate(err)}

										Service.destroy({
											entreprise_id: entrepriseId
										}, function(err){
											if(err){return res.negotiate(err)}


											Notification.destroy({
												entreprise_id: entrepriseId
											}, function(err){
												if(err){return res.negotiate(err)}

												res.json({done:"entreprise and child removed"})
												
											})
											
										})

									})
								
									

								})


						})

					}

				})

			})

		})


	}

};