var jwt = require('jsonwebtoken');
module.exports = {


	getentrepriseserviceschedule: function(req, res){

		var entrepriseId = req.param('entreprise_id'),
				serviceId = req.param('service_id'),
				employeesId = JSON.parse(req.param('employees_id')),
				date = new Date(req.param('date')),
				firstDayMonth = new Date(date.getFullYear(), date.getMonth(), 1),
				lastDayMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

		var out = [];


		Service.findOne({
			id: serviceId
		}, function(err, service){

		  if(err) return res.negotiate(err);

		  
		  // verify if employee asked wrok on the service
			try {

				service.employees_id = JSON.parse(service.employees_id);

				var employeesIdTemp = [];

				for(var si in service.employees_id){

					for(var ei in employeesId){

						if(service.employees_id[si] == employeesId[ei]){
							employeesIdTemp.push(service.employees_id[si]);
						}

					}

				}

				employeesId = employeesIdTemp;


				Employee.find({
			  	entreprise_id: entrepriseId,
			  	user_id: employeesId,
		  	}, function(err, employees){

		  		if(err) return res.negotiate(err);
					
		  		User.find({
		  			id: employeesId
		  		}, function(err, users){

		  			if(err) return res.negotiate(err);

			  		// transform employee schedule on object/array
			  		// and save employe with schedule valide

			  		var employeesTemp = [],	
			  				employeesIdTemp = [];

			  		for(var empl of employees){

			  			try {

			  				empl.schedule = JSON.parse(empl.schedule);
			  				empl.name = functionsTool.findNameOfUserId(empl.user_id, users);
			  				employeesTemp.push(empl);
			  				employeesIdTemp.push(empl.user_id)

			  			}catch(e){

			  			}

			  		}

			  		employees = employeesTemp;
			  		employeesId = employeesIdTemp;


			  		Appointment.find({
			  			entreprise_id:entrepriseId,
			  			employee_id:employeesId,
			  			service_id:serviceId,
			  			timestamp: {
			  				'>' : firstDayMonth,
			  				'<' : lastDayMonth
			  			},
			  			status: [1,2]
			  		}, function(err, appointment){

			  			if(err) return res.negotiate(err);


			  			// create block time for each emp schedule

			  			for(var ei in employees){

			  				var scheduleBlock = [];
			  						employees[ei].final_schedule = {};

			  				for(var day in employees[ei].schedule){

			  					var blockDay = [];

			  					for(var mmt in employees[ei].schedule[day]){

			  						if(employees[ei].schedule[day][mmt]['start'] && employees[ei].schedule[day][mmt]['end']){

				  						blockDay.push([
				  							functionsTool.hourMinuteToMinute(employees[ei].schedule[day][mmt]['start']), 
				  							functionsTool.hourMinuteToMinute(employees[ei].schedule[day][mmt]['end'])
				  						]);

				  					}

			  					}

			  					scheduleBlock.push({
			  						day_name: day,
			  						blocks: blockDay
			  					})

			  				}

			  				employees[ei].schedule_block = scheduleBlock;

			  			}


			  			// create block time for each appointement

			  			for(var ai in appointment){

			  				var scheduleBlock = [],

			  						aptStart = functionsTool.hourMinuteToMinute(appointment[ai].hour),
			  						aptEnd = functionsTool.hourMinuteToMinute(appointment[ai].hour) + appointment[ai].duration;

			  				appointment[ai].schedule_block = [aptStart, aptEnd];

			  			}


							var monthDisponibilities = {};


			  			// remove appointment from all employee schedule > to get disponibility

							for (var d = firstDayMonth; d <= lastDayMonth; d.setDate(d.getDate() + 1)) {

							    var dateLoop = new Date(d),
							    		dateLoopFormated = dateLoop.toLocaleDateString();
							    
							    monthDisponibilities[dateLoopFormated] = {};
							    monthDisponibilities[dateLoopFormated]['date']= dateLoopFormated;

							    for(var ei in employees){

										var	empId = employees[ei].user_id,
												apts = [];

										for(var apt of appointment){

											var aptDate = new Date(apt.date),
													aptDate = aptDate.toLocaleDateString(),
													today = dateLoop.toLocaleDateString();

											if(today==aptDate && apt.employee_id == empId ){
												apts.push([apt.schedule_block[0], apt.schedule_block[1]+apt.break_time]);
											}

										}

										var dateLoopDayFormated = dateLoop.getDay()-1;

										if(dateLoopDayFormated<0){
											dateLoopDayFormated = 6
										}else if(dateLoopDayFormated>6){
											dateLoopDayFormated = 0;
										}

										var emplTempBls = JSON.stringify(employees[ei].schedule_block[dateLoopDayFormated].blocks);
										emplTempBls = JSON.parse(emplTempBls);

										var finalScheduleTemp = functionsTool.removeAppointmentFromSchedule(emplTempBls, apts);
										finalScheduleTemp = functionsTool.transformScheduleWithServiceDuration(finalScheduleTemp, service['duration']+service['break_time']);

										employees[ei].final_schedule[dateLoop.toLocaleDateString()] = finalScheduleTemp;



										// update the month disponibilities

										for(var fs of finalScheduleTemp){
											
											var hour = Math.floor(fs[0]/60),
													thisDate = dateLoop.toLocaleDateString()

											if(!monthDisponibilities[thisDate]){
												monthDisponibilities[thisDate] = {};
											}

											if(!monthDisponibilities[thisDate][hour]){
												monthDisponibilities[thisDate][hour] = [];
											}

	                
			                var th = Math.floor(fs[0]/60),
			                    tm = fs[0] - (60*th),
			                    th = functionsTool.addZeroIfUnderOfTen(th),
			                    tm = functionsTool.addZeroIfUnderOfTen(tm),
			                    t = th+":"+tm,

			                    tdate = new Date(thisDate+" "+th+":"+tm)

											monthDisponibilities[thisDate][hour].push({
												block: fs,
												year: tdate.getFullYear(),
												month: functionsTool.addZeroIfUnderOfTen(tdate.getMonth()+1),
												day: functionsTool.addZeroIfUnderOfTen(tdate.getDate()),
												hour: th,
												minute: tm,
												time: t,
												date: thisDate,
												employee_id: employees[ei].user_id,
												employee_name: employees[ei].name,
												datehour: functionsTool.addZeroIfUnderOfTen(tdate.getDate())+"/"+ functionsTool.addZeroIfUnderOfTen((tdate.getMonth()+1)) +"/"+tdate.getFullYear()+" "+t

											})

										}
										
							    }

							}


			  			res.json(monthDisponibilities);

			  		})


			  	})
	
				});




			}catch(e){

				res.json({err:"this service has no employee"});

			}


		})
	},

	getschedule: function(req, res){

		var entrepriseId = req.param('entreprise_id'),
				serviceId = req.param('service_id'),
				employeeId = req.param('employee_id'),
				// dayApmt = "2017-03-22";
				dayApmt = req.param('date');

		var employeeBaseSchedule = [], 
				employeeFinalSchedule = [], 
				employeeSchuduleTemp = [],
				appointmentSchedule = [],
				finalSchedule = [],
				ducalm = [],
				com = [];

		var error = false;


		// check if entreprise exist

		Entreprise.getbyid({
			id:entrepriseId
		}, function(err,entreprise){

			if(err) return res.negotiate(err);

  		if(!entreprise){  			
        if (req.wantsJSON) {
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}

  		if(entreprise.length<=0){

  			error = true;
  			com.push("ERROR: entreprise not found");

  		}else{
		

				// get emplyoee and his schedul
				Employee.getbyids({
					user_id: employeeId,
					entreprise_id: entrepriseId
				}, function(err, employee){

		  		if(err) return res.negotiate(err);

		  		if(!employee){  			
		        if (req.wantsJSON) {
		          return res.json({error:"invalid"})
		        }
		        return res.json({message:'invalid'});
		  		}


		  		Service.getbyid({ // we need the service information such as duration and break time to create the final scheduale
						id: serviceId
					}, function(err, service){

			  		if(err) return res.negotiate(err);

			  		if(!service){  			
			        if (req.wantsJSON) {
			          return res.json({error:"invalid"})
			        }
			        return res.json({message:'invalid'});
			  		}	 


			  		// check if the employeeId can work on the service
			  		var employees_id = JSON.parse(service['employees_id']);			  		

			  		if( employees_id.indexOf(parseInt(employeeId)) == "-1"){
			  			return res.json({err:"employee not alowed",com:com})
			  		}else{

				  		com.push(employees_id);


				  		if(typeof employee == 'object' && typeof employee['schedule']=='string'){

				  			// var schedule = JSON.parse(employee['schedule']);


				  			try {

				  			// Get the emplyoeeSchedule
				  				var schedule = JSON.parse(employee['schedule']);

				  				Appointment.getbyidsdate({
					  				entreprise_id:entrepriseId,
					  				employee_id:employeeId,
					  				date:dayApmt
					  			}, function(err, appointment){

							  		if(err) return res.negotiate(err);

							  		if(!appointment){  			
							        if (req.wantsJSON) {
							          return res.json({error:"invalid"})
							        }
							        return res.json({message:'invalid'});
							  		}


								  	// Get the day asked from date to name
								  	var mydate = new Date(dayApmt);
								  	var day = mydate.getDay();

										day = functionsTool.getDayFromNumber(day);


										// Save the employeeBaseSchedule in employeeBaseSchedule
						  			employeeBaseSchedule = schedule[day];
						  			ducalm = schedule;

								  	if(appointment.length>0){

								  	
								  		// Create appointmentSchedule
								  		for(var i=0; i<appointment.length; i++){
												
												// to facilite the calcule, we gonna transform schedule hour:minute info into minute
								  			var apmtHour = appointment[i]['hour'].split(':'),
								  					apmtStart = parseInt( parseInt(apmtHour[0]*60) + parseInt(apmtHour[1]) ),
								  					apmtEnd = apmtStart +appointment[i]['duration']+appointment[i]['break_time'];


								  			var apmt = [apmtStart, apmtEnd]

								  			appointmentSchedule.push(apmt);

								  		}


								  	}
								  	com.push({emp:employeeBaseSchedule})

								  	
								  	// transform employeeBaseSchedule time from hour:minute into minute
								  
								  	if(typeof employeeBaseSchedule['morning']['start'] == "string"){
								  		employeeBaseSchedule['morning']['start'] = functionsTool.hourMinuteToMinute(employeeBaseSchedule['morning']['start'])
								  	}
								  	if(typeof employeeBaseSchedule['morning']['end'] == "string"){
								  		employeeBaseSchedule['morning']['end'] = functionsTool.hourMinuteToMinute(employeeBaseSchedule['morning']['end'])
								  	}
								  	if(typeof employeeBaseSchedule['afternoon']['start'] == "string"){
								  		employeeBaseSchedule['afternoon']['start'] = functionsTool.hourMinuteToMinute(employeeBaseSchedule['afternoon']['start'])
								  	}
								  	if(typeof employeeBaseSchedule['afternoon']['end'] == "string"){
								  		employeeBaseSchedule['afternoon']['end'] = functionsTool.hourMinuteToMinute(employeeBaseSchedule['afternoon']['end'])
								  	}

									  


								  	// transform employeeBaseSchedule object format to [ [x.y],[x.y] ]

								  	if(typeof employeeBaseSchedule['morning']['start'] == "number" && typeof employeeBaseSchedule['morning']['end'] == "number"){

								  		employeeSchuduleTemp.push([employeeBaseSchedule['morning']['start'],employeeBaseSchedule['morning']['end']])

								  	}
								  	if(typeof employeeBaseSchedule['afternoon']['start'] == "number" && typeof employeeBaseSchedule['afternoon']['end'] == "number"){

								  		employeeSchuduleTemp.push([employeeBaseSchedule['afternoon']['start'],employeeBaseSchedule['afternoon']['end']])

								  	}

								  	employeeBaseSchedule = employeeSchuduleTemp;
								  	
								  	// Reinit 
								  	employeeSchuduleTemp = [];

								  	var out = [];

								  	out.push({employeeBaseSchedule:employeeBaseSchedule,appointmentSchedule:appointmentSchedule})


								  	// remove appointmentSchedule to the employeeBaseSchedule
								   	while ( getFinalSchedule()!="stop" ){}

								  	function getFinalSchedule(){

								  		for(var ei=0; employeeBaseSchedule.length > ei ; ei++ ){

								  			for(var ai=0; appointmentSchedule.length > ai ; ai++){


								  				if(employeeBaseSchedule[ei][0] < appointmentSchedule[ai][0] && appointmentSchedule[ai][1] < employeeBaseSchedule[ei][1]){

								  					var tempSchedule = [];

								  					tempSchedule.push([ employeeBaseSchedule[ei][0], appointmentSchedule[ai][0] ])
								  					tempSchedule.push([ appointmentSchedule[ai][1], employeeBaseSchedule[ei][1] ])

								  					delete employeeBaseSchedule[ei];

								  					employeeBaseSchedule=employeeBaseSchedule.filter(function(n){ return n != undefined }); 

								  					tempSchedule.forEach(function(e,i){
								  						employeeBaseSchedule.push(e);
								  					})

								  					return "rs";

								  				}

								  				if( employeeBaseSchedule[ei][0] < appointmentSchedule[ai][0] && 
								  						appointmentSchedule[ai][0] < employeeBaseSchedule[ei][1] &&
								  						employeeBaseSchedule[ei][1] <= appointmentSchedule[ai][1]){

								  					var tempSchedule = [];
								  					tempSchedule.push([ employeeBaseSchedule[ei][0], appointmentSchedule[ai][0] ])

								  					delete employeeBaseSchedule[ei];
								  					employeeBaseSchedule=employeeBaseSchedule.filter(function(n){ return n != undefined }); 

								  					tempSchedule.forEach(function(e,i){
								  						employeeBaseSchedule.push(e);
								  					})

								  					return "rs";
								  				}

								  				if(	appointmentSchedule[ai][0] <= employeeBaseSchedule[ei][0] &&
								  						employeeBaseSchedule[ei][0] < appointmentSchedule[ai][1] &&
								  						appointmentSchedule[ai][1] < employeeBaseSchedule[ei][1]
								  						){			  					

								  					var tempSchedule = [];
								  					tempSchedule.push([ appointmentSchedule[ai][1], employeeBaseSchedule[ei][1] ])

								  					delete employeeBaseSchedule[ei];
								  					employeeBaseSchedule=employeeBaseSchedule.filter(function(n){ return n != undefined }); 

								  					tempSchedule.forEach(function(e,i){
								  						employeeBaseSchedule.push(e);
								  					})

								  					return "rs";
								  				}

								  				if( appointmentSchedule[ai][0] <= employeeBaseSchedule[ei][0] &&
								  						employeeBaseSchedule[ei][1] <= appointmentSchedule[ai][1] ){

								  					delete employeeBaseSchedule[ei];
								  					employeeBaseSchedule=employeeBaseSchedule.filter(function(n){ return n != undefined }); 

								  					return "rs";
								  				}


								  			}

								  		}

								  		return "stop";

								  	}		


								  	// Create the final schedule appoitment possibility						
							  		var appointment_duration = service['duration']+service['break_time'];

							  		employeeBaseSchedule.forEach(function(e,i){

							  			var delta_time = e[1] - e[0]
							  					appointment_possibility = Math.floor(delta_time/appointment_duration);

							  			for(var i=0; i<appointment_possibility;i++){

							  				finalSchedule.push( [ e[0] + appointment_duration*i  , (e[0] + appointment_duration*i) + appointment_duration ])

							  			}

							  		})




										
								  	return res.json({
						  				// appointment:appointment,
						  				// employee:employee, 
						  				// day:day, 
						  				// com:com,
						  				// empBase:ducalm,
						  				// appointmentSchedule:appointmentSchedule, 
						  				// employeeBaseSchedule:employeeBaseSchedule,
						  				// employeeSchuduleTemp:employeeSchuduleTemp,
						  				// service:service
						  				// ducal:ducalm,
						  				out:out,
						  				finalSchedule:finalSchedule
						  			})

							  	})	


				  			}catch(e){
				  				return res.json({err:"not json or empty"});
				  			}

				  		}else{
				  			var err="employee not found";
				  			return res.json({err:err, emL: typeof employee, emT: typeof employee['schedule'] })
				  		}

				  	}

			  	})

				})

			}

		})


	},

	create: function(req, res){

		var entrepriseId = req.param('entreprise_id'),
				serviceId = req.param('service_id'),
				employeeId = req.param('employee_id'),
				customerId = req.param('customer_id'),
				homeLocation = "",
				contactNumber = "",
				customer = "",
				// dayApmt = "2017-03-22";
				dayApmt = req.param('date'),
				minute = req.param('minute'),
				fs = [],
				customerNotRegistered = false;

		if(req.param('home_location')){
			homeLocation = req.param('home_location');
		}
		if(req.param('contact_number')){
			contactNumber = req.param('contact_number');
		}
		if(req.param('customer')){
			try {
				customer = JSON.parse(req.param('customer'));
				customerNotRegistered = true;
			}catch(e){ console.log({errClient: e})}
		}

		console.log(req.allParams());
		var com = []
				findAPlace = false;

		functionsTool.getschedule({entreprise_id:entrepriseId, service_id:serviceId, employees_id:[employeeId], date:dayApmt}, function(schedule){

			if(schedule.schedule){

				var finalSchedule = schedule.schedule,
						service = schedule.service;

				for(n in finalSchedule){

					if( finalSchedule[n][0]<=minute && finalSchedule[n][1]>= ( parseInt(minute)+parseInt(schedule.service['duration'])  ) ){
						
						findAPlace = true;										

						com.push('PLACE FOUNDED');
					}

				}

				if(!findAPlace){

					res.json({
						err: "no place found___"

					})

				}else{

					var appttimestamp = dayApmt+" "+functionsTool.minuteToHourMinute(minute),
							status = 2;

					if(customerNotRegistered) status = 1

					Appointment.create({
						entreprise_id: entrepriseId,
						employee_id: employeeId,
						customer_id: customerId,
						service_id: serviceId,
						status: status,
						date: dayApmt,
						hour: functionsTool.minuteToHourMinute(minute),
						timestamp: appttimestamp,
						duration: service['duration'],
						break_time: service['break_time'],
						location: homeLocation,
						contact_number: contactNumber,
						description: "",
						customer: req.param('customer')
					}).exec(function(err, appt){
						
						if(err){ return res.serverError(err); }	

						// res.json({msg:"APT CREATED :D", appt:appt})

						functionsTool.addNamesToAppointment({apt: appt, single: true}, function(aptNamed){

							var type = 'appointment_new';

							if(customerId==0){
								type = 'handly_created';
							}

							Notification.create({
								user_id: employeeId,
								type: type,
								entreprise_id: service['entreprise_id'],
								sub_infos: JSON.stringify(aptNamed),
								seen: 0,
								pushed: 0
							}).exec(function(err, notif){
							
								if(err){ return res.serverError(err); }

								notificationService.tryToPushNotificationToUserId(employeeId, notif, function(result){

									console.log({ohoho: result});

									return res.json({
										appointment: aptNamed,
										findAPlace:findAPlace
									});	

								})


							})
	
						})	
						
					})	

				}

			}

		

/*
			com.push(schedule);


			if(schedule['err']){
				res.json({err: schedule['err'], epid: employeeId});
			}else{


				if(schedule['finalSchedule']){

					var finalSchedule = schedule['finalSchedule'],
							service = schedule['serviceInfos'];


					for(n in finalSchedule){

						fs.push([finalSchedule[n][0],finalSchedule[n][1]]);

						if( finalSchedule[n][0]<=minute && finalSchedule[n][1]>= ( parseInt(minute)+parseInt(service['duration'])  ) ){
							
							findAPlace = true;										

							com.push('PLACE FOUNDED');
						}

					}

					if(!findAPlace){

						res.json({err: "no place found", 
							sch: schedule, 
							min: minute,
							fs: fs,
							ed: ( parseInt(minute)+parseInt(service['duration']) ),
							com:com

						})

					}else{

						res.json({com:com});

						var appttimestamp = dayApmt+" "+functionsTool.minuteToHourMinute(minute);

						com.push({entreErroId: entrepriseId})

						Appointment.create({
							entreprise_id: entrepriseId,
							employee_id: employeeId,
							customer_id: customerId,
							service_id: serviceId,
							status: 2,
							date: dayApmt,
							hour: functionsTool.minuteToHourMinute(minute),
							timestamp: appttimestamp,
							duration: service['duration'],
							break_time: service['break_time'],
							location: "",
							description: ""
						}).exec(function(err, appt){
							
							if(err){ return res.serverError(err); }								

								// res.json({aptN: aptNamed, apt: [appt]})

							Appointment.find({
								entreprise_id: entrepriseId,
								employee_id: employeeId,
								customer_id: customerId,
								service_id: serviceId,
								status: 2,
								date: dayApmt,
								hour: functionsTool.minuteToHourMinute(minute),
								timestamp: appttimestamp,
								duration: service['duration'],
								break_time: service['break_time']
							}).exec(function(err, aptwithid){

								if(err){return res.serverError(err)}

								functionsTool.addNamesToAppointment({apt: aptwithid[0], single: true}, function(aptNamed){

									Notification.create({
										user_id: employeeId,
										type: 'appointment_new',
										entreprise_id: entrepriseId,
										sub_infos: JSON.stringify(aptNamed),
										seen: 0
									}).exec(function(err, notif){
									
										if(err){ return res.serverError(err); }

										return res.json({
											appointment: aptNamed,
											findAPlace:findAPlace
										});	

									})

								})									

							})									

						})
						
					}


				}else{
					com.push({err: "no finalSchedule"});
				}

			}*/
			
			// doing some stuff with the data and then
			/*return res.json({
				// schedule: schedule, 
				// com:com, 
				findAPlace:findAPlace
			});*/

		});

	},

	getmonth: function(req, res){

		var year = req.param("year"),
				month = req.param("month");

		var users = [],
				entreprises = [],
				services = [];

		var tofind = {
			users: [],
			entreprises: [],
			services: []
		}

		var ordered = {
			users: {},
			entreprises: {},
			services: {}			
		}

		if(month<10){
			month = "0"+month;
		}

		var yearMonth = year + "-" + month;

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


        Appointment.find({
        	or : [
        		{ customer_id: user.id },
        		{ employee_id: user.id },

        	],
        	date: {
        		'startsWith': yearMonth
        	}
       	}).exec(function(err, apt){
       		if(err){ res.negotiate({err:err})}


       		for(var n in apt){


       			if(tofind['users'].indexOf( apt[n].customer_id )<0 && apt[n].customer_id!=0){
       				tofind['users'].push(apt[n].customer_id);
       			}
       			if(tofind['users'].indexOf( apt[n].employee_id )<0){
       				tofind['users'].push(apt[n].employee_id);
       			}
       			if(tofind['entreprises'].indexOf( apt[n].entreprise_id) <0 ){
       				tofind['entreprises'].push( apt[n].entreprise_id );
       			}
       			if(tofind['services'].indexOf( apt[n].service_id) <0 ){
       				tofind['services'].push( apt[n].service_id );
       			}

       		}

       		User.find({
       			id: tofind['users']
       		}).exec(function(err, usr){


       			if(err){ res.json({err:err})}

       			for(var ui in usr){
       				ordered['users'][ usr[ui].id ] = usr[ui].name;
       			}


	       		Entreprise.find({
	       			id: tofind['entreprises']
	       		}).exec(function(err, entreprises){

	       			if(err){ res.json({err:err})}

	       			for(var ei in entreprises){
	       				ordered['entreprises'][ entreprises[ei].id ] = entreprises[ei].name;
	       			}

		       		Service.find({
		       			id: tofind['services']
		       		}).exec(function(err, srv){

		       			if(err){ res.json({err:err})}

		       			for(var si in srv){
		       				ordered['services'][ srv[si].id ] = srv[si].name;
		       			}	



		       			for(var ai in apt){

		       				if(apt[ai].customer_id==0){

		       					try {
		       						var customerInfos = JSON.parse(apt[ai].customer);
		       						apt[ai]['customer_name'] = customerInfos['name'];
		       						apt[ai]['customer_surname'] = customerInfos['surname'];
		       					}catch(e){console.log({xxeerror: e})};
		       					
		       				}else{
		       					apt[ai]['customer_name'] = ordered['users'][ apt[ai].customer_id ];
		       				}

		       				apt[ai]['employee_name'] = ordered['users'][ apt[ai].employee_id ];
		       				apt[ai]['service_name'] = ordered['services'][ apt[ai].service_id ];
		       				apt[ai]['entreprise_name'] = ordered['entreprises'][ apt[ai].entreprise_id ];

		       			}

       					res.json(apt)

       				})

       			});

       		})

       	})


      })

    })

	},

	getunanswered: function(req, res){

		var token = req.header('authorization');


		var letshow = false;

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

        var userId = user.id;

        userId = user.id;

        Employee.getbyid({
        	// user_id: user.id
        	user_id: userId
        }, function(err, employee){
        	

        	if(err){ res.json(err)}

        	var entreprises = {
        		id_list: [],
        		auth: {}
        	};

        	for(var ei in employee){


        		entreprises.id_list.push(employee[ei].entreprise_id);
        		entreprises.auth[employee[ei].entreprise_id] = JSON.parse(employee[ei].authorization);

        	}


    			functionsTool.getunanswered({entreprises:entreprises, user_id: userId}, function(apt){

    				if(!('err' in apt)){

    					functionsTool.addNamesToAppointment({apt: apt}, function(aptNamed){
    						res.json(aptNamed)
    					});    				

	    			}else{
	    				return res.json("No appointement unanswered")
	    			}

    			})

        })

      });

    });

	},

	getbyentrepriseid: function(req, res){

		var entrepriseId = req.param('entreprise'),
				dateReq = req.param('date');
		var token = req.header('authorization');

		// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE0OTM5ODExMTMsImV4cCI6MTQ5NDA2NzUxM30.YjqMrE-PYHWc-4rtm4TxvQs-5Ja9D2PoE-1ryOEkL0U";


		var letshow = false;

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

        var userId = user.id;

        var date = new Date(dateReq),
        		firstday = {}, 
        		lastday = {};

        firstday = { 
        	year: date.getFullYear(),
        	month: functionsTool.addZeroIfUnderOfTen( date.getMonth()-1 ),
        	day: functionsTool.addZeroIfUnderOfTen( date.getDate() )
        }
        lastday = { 
        	year: date.getFullYear(),
        	month: functionsTool.addZeroIfUnderOfTen( date.getMonth()+ 3 ),
        	day: functionsTool.addZeroIfUnderOfTen( date.getDate() )
        }

        firstday['date'] = new Date(firstday['year']+"/"+firstday['month']+"/"+firstday['day']);
        lastday['date'] = new Date(lastday['year']+"/"+lastday['month']+"/"+lastday['day']);

      	Employee.find({
      		entreprise_id: entrepriseId,
      		user_id: userId
      	}).exec(function(err, empl){

      		if(err){res.json({err:'employee not found'})}

      		empl = empl[0];

      		try {

	      		empl.authorization = JSON.parse(empl.authorization)


	      		if(empl.authorization['appointmentAll']){


	      			Appointment.find({
	      				entreprise_id: entrepriseId,
	      				date: { '>': firstday['date'], '<': lastday['date'] }
	      			}).exec(function(err, apt){
	      				
	      				if(err){res.json('no apt found')}


		      			functionsTool.addNamesToAppointment({apt: apt}, function(apt){
		      			
		      				res.json(apt);

		      			})


	      			})


	      		}else{

	      			res.json({'err':'employee have not the privilege'})

	      		}

	      	}catch(e){
	      		res.json({errCatched: e});
	      	}

      	})

      })

    })

	},

	getbyid:function(req, res){

		var id = req.param('id');

		var token = req.header('authorization');
		/*token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE0OTMzNzM4MTAsImV4cCI6MTQ5MzQ2MDIxMH0.ff1ZV3J0ztmewfmcvrpSASbj3ogbCS9DjO7QkTXKKPM";*/


		var letshow = false;

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

        Appointment.find({id: id}).exec(function(err, apt){

        	if(err){res.json({err:'Appointment not found'})}


        	functionsTool.addNamesToAppointment({apt: apt}, function(apt){

	        	apt = apt[0];


	       		if(user.id == apt['customer_id'] || user.id == apt['employee_id']){
	       			
	       			res.json(apt);

	       		}else{

	       			Employee.find({
	       				user_id: user.id,
	       				entreprise_id: apt['entreprise_id'],
	       			}).exec(function(err, empl){

	       				if(err){res.json({err:'Appointment not found'})}

	       				empl = empl[0];
	       				empl.authorization = JSON.parse(empl.authorization);

	       				functionsTool.getservicesofemployeeinallentreprise({employee_id: user.id, entreprises_id: apt['entreprise_id']}, function(serv){
	       				
	       					var servicesId = [], showApt = false;

	       					for(var si in serv){
	       						servicesId.push(serv[si].id);
	       					}

	       					if(empl.authorization['appointmentAll']){ showApt = true; }
	       					if(empl.authorization['appointmentSelfService'] && servicesId.indexOf(apt['services_id'])>= 0 ){ 
	       						showApt = true; 
	       					}
	 
	      					if(showApt){
	       						res.json({apt: apt});
	       					}else{
	       						res.json({err:'No privilege'})
	       					}

	       				})


	       			})
	       			

	       		}

	       	})

        })

      })

    })

	},

	accept: function(req, res){

		var aptId = req.param("appointment_id");

		var token = req.header('authorization');
		/*token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE0OTQyNTA2NjEsImV4cCI6MTQ5NDMzNzA2MX0.aqaCMh8-5cwd5Ji84NuIcX_d3G0654d5apszpK955bM";*/


		var letshow = false;

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


        Appointment.find({id: aptId}).exec(function(err, apt){
        	
        	if(err){res.json({err:err})}

        	if(apt.length>0){
        		apt = apt[0];


						functionsTool.getservicesofemployeeinallentreprise({
		        	entreprises_id: apt.entreprise_id,
		        	employee_id: user.id}, function(srv){

		        	Employee.find({
		        		entreprise_id: apt.entreprise_id,
		        		user_id: user.id
		        	}).exec(function(err, empl){

		        		if(err){res.json({err:err})}

		        		if(empl.length>0){
			        		empl = empl[0];

			        		if(empl.authorization){

			        			var canAccept = false, o = [];

			        			empl.authorization = JSON.parse(empl.authorization)

			        			if(empl.authorization.appointmentAll){
			        				canAccept = true;
			        			}

			        			if(empl.authorization.appointmentSelfService){

			        				for(si in srv){
			        					if(srv[si].id == apt.service_id){
			        						canAccept = true;
			        					}
			        				}

			        			}

			        			if(empl.authorization.appointementSelf && user.id == apt.employee_id){
			        				canAccept = true;
			        			}

			        			if(canAccept){

			        				Appointment.update({id: aptId}, {status: 1}).exec(function(err, newApt){
			        					if(err){res.json({err: err})}

			        					functionsTool.appointmentAccepted({event: newApt}, function(nap){
			        						res.json(newApt);
			        					})

			        				})

			        			}else{
			        				res.json({err:'employe not authorized to update appointment'})
			        			}


			        		}else{
			        			res.json({err: 'employee not authorized'})
			        		}


			        	}else{
			        		res.json({err: 'no employee found'});
			        	}


		        	})

		        })

	      	}else{
	      		res.json({err: 'appointment no found '+aptId})
	      	}

	      })               

      })

    })

	},

	refuse: function(req, res){

		var aptId = req.param("appointment_id");

		var token = req.header('authorization');
		// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE0OTQyNTA2NjEsImV4cCI6MTQ5NDMzNzA2MX0.aqaCMh8-5cwd5Ji84NuIcX_d3G0654d5apszpK955bM";
		


		var letshow = false;

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


        Appointment.find({id: aptId}).exec(function(err, apt){
        	
        	if(err){res.json({err:err})}

        	if(apt.length>0){
        		apt = apt[0];


						functionsTool.getservicesofemployeeinallentreprise({
		        	entreprises_id: apt.entreprise_id,
		        	employee_id: user.id}, function(srv){

		        	Employee.find({
		        		entreprise_id: apt.entreprise_id,
		        		user_id: user.id
		        	}).exec(function(err, empl){

		        		if(err){res.json({err:err})}

		        		if(empl.length>0){
			        		empl = empl[0];

			        		if(empl.authorization){

			        			var canRefuse = false, o = [];

			        			empl.authorization = JSON.parse(empl.authorization)

			        			if(empl.authorization.appointmentAll){
			        				canRefuse = true;
			        			}

			        			if(empl.authorization.appointmentSelfService){

			        				for(si in srv){
			        					if(srv[si].id == apt.service_id){
			        						canRefuse = true;
			        					}
			        				}

			        			}

			        			if(empl.authorization.appointementSelf && user.id == apt.employee_id){
			        				canRefuse = true;
			        			}

			        			if(canRefuse){

			        				Appointment.update({id: aptId}, {status: 0}).exec(function(err, newApt){
			        					if(err){res.json({err: newApt})}

			        					functionsTool.appointmentRefused({event: newApt}, function(nap){
			        						res.json(newApt);
			        					})

			        				})

			        			}else{
			        				res.json({err:'employe not authorized to update appointment'})
			        			}


			        		}else{
			        			res.json({err: 'employee not authorized'})
			        		}


			        	}else{
			        		res.json({err: 'no employee found'});
			        	}


		        	})

		        })

	      	}else{
	      		res.json({err: 'appointment no found '+aptId})
	      	}

	      })               

      })

    })

	}



}