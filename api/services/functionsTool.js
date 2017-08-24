

module.exports = {

	isValidName:function(name){
		var re = /^[A-zÀ-ú .'-]+$/i;
		return re.test(name);
	},

	isValidEmail: function(email){
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  	return re.test(email);
	},

	isValidPassword: function(pw){
		
		var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return re.test(pw);

	},

	getDayFromNumber: function(day){

		var finalDay;

		if(typeof day == "number"){

			switch(day){

				case 1: finalDay = "monday"; break;
				case 2: finalDay = "tuesday"; break;
				case 3: finalDay = "wednesday"; break;
				case 4: finalDay = "thursday"; break;
				case 5: finalDay = "friday"; break;
				case 6: finalDay = "saturday"; break;
				case 0: finalDay = "sunday"; break;

			}

		}

		return finalDay;

	},

	addZeroIfUnderOfTen(n){
		var e;

		if(n<10){
			e = "0"+n;
		}else{
			e = n;
		}
		return e;
	},

	hourMinuteToMinute(time){

		time = time.split(':');
		time = parseInt( parseInt(time[0]*60) + parseInt(time[1]) );

		return time;

	},

	minuteToHourMinute(minute){

		var hour = Math.floor(minute/60),
				minute = parseInt(minute) - parseInt(hour*60),
				hourMinute;

		if(minute<10){
			minute = "0"+minute;
		}

		hourMinute = hour+":"+minute;

		return hourMinute;

	},

	findNameOfUserId(idToFind, arr){

		var name = "";

		if(typeof arr == "object"||typeof arr == "array"){



			for(var i in arr){

				if(arr[i].id== idToFind){
					name = arr[i].name;
				}

			}

			return name;

		}else{
			return "user not found";
		}
	},

	transformScheduleWithServiceDuration(sched, appointment_duration){

		var finalSchedule = [];

		sched.forEach(function(e,i){

			var delta_time = e[1] - e[0]
					appointment_possibility = Math.floor(delta_time/appointment_duration);

			for(var i=0; i<appointment_possibility;i++){

				finalSchedule.push( [ e[0] + appointment_duration*i  , (e[0] + appointment_duration*i) + appointment_duration ])

			}

		})

		return finalSchedule;

	},

	removeAppointmentFromSchedule(sched, apt){

		var employeeBaseSchedule = sched,
				appointmentSchedule = apt;

		var fout = [];


		// while ( getFinalSchedule()!="stop" ){}

		var loopDo = "";

  	while(loopDo!="stop"){

  		if(loopDo!="stop" && loopDo =="rs"){ loopDo = '';}

  		for(var ei=0; employeeBaseSchedule.length > ei ; ei++ ){

  			for(var ai=0; appointmentSchedule.length > ai ; ai++){

  				// fout.push({ei: employeeBaseSchedule[ei], ai:appointmentSchedule[ai]});


  				if(employeeBaseSchedule[ei][0] < appointmentSchedule[ai][0] && appointmentSchedule[ai][1] < employeeBaseSchedule[ei][1]){

  					var tempSchedule = [];

  					tempSchedule.push([ employeeBaseSchedule[ei][0], appointmentSchedule[ai][0] ])
  					tempSchedule.push([ appointmentSchedule[ai][1], employeeBaseSchedule[ei][1] ])

  					delete employeeBaseSchedule[ei];

  					employeeBaseSchedule=employeeBaseSchedule.filter(function(n){ return n != undefined }); 

  					tempSchedule.forEach(function(e,i){
  						employeeBaseSchedule.push(e);
  					})

  					// fout.push('1 worked');

  					loopDo = "rs";

  				}

  				if(loopDo!='rs' || loopDo != "stop"){
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

  					// fout.push('2 worked');

	  					loopDo = "rs";
	  				}
	  			}
	  			if(loopDo!='rs' || loopDo != "stop"){
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

  					// fout.push('3 worked');

	  					loopDo = "rs";
	  				}
	  			}
					if(loopDo!='rs' || loopDo != "stop"){
	  				if( appointmentSchedule[ai][0] <= employeeBaseSchedule[ei][0] &&
	  						employeeBaseSchedule[ei][1] <= appointmentSchedule[ai][1] ){

	  					delete employeeBaseSchedule[ei];
	  					employeeBaseSchedule=employeeBaseSchedule.filter(function(n){ return n != undefined }); 

	  					loopDo = "rs";
	  				}
	  			}


  			}

  		}

  		loopDo = "stop";

  	}


  	return employeeBaseSchedule;

	},


	getschedule(params, cb){

		var	entrepriseId = params.entreprise_id,
				serviceId = params.service_id, 
				employeesId = params.employees_id,
				date = params.date,
				rangeDate = false,
				out = [];


		if(params.range_dates){
			rangeDate = params.range_dates;
		}


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
					


		  		// transform employee schedule on object/array
		  		// and save employe with schedule valide

		  		var employeesTemp = [],	
		  				employeesIdTemp = [];

		  		for(var empl of employees){

		  			try {

		  				empl.schedule = JSON.parse(empl.schedule);
		  				employeesTemp.push(empl);
		  				employeesIdTemp.push(empl.user_id)

		  			}catch(e){

		  			}

		  		}

		  		employees = employeesTemp;
		  		employeesId = employeesIdTemp;

		  		var aptQuery = {};

		  		if(rangeDate){

			  		aptQuery = {
			  			entreprise_id:entrepriseId,
			  			employee_id:employeesId,
			  			service_id:serviceId,
			  			timestamp: {
			  				'>' : rangeDate[0],
			  				'<' : rangeDate[1]
			  			},
			  			status: [1,2]
			  		}

		  		}else{

			  		aptQuery = {
			  			entreprise_id:entrepriseId,
			  			employee_id:employeesId,
			  			service_id:serviceId,
			  			date: date,
			  			status: [1,2]
			  		}

		  		}


		  		Appointment.find(aptQuery, function(err, appointment){

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


						var monthDisponibilities = {},
								sctemp, apts = [], thisDate = new Date(date);


						if(!rangeDate){

							for(var apt of appointment){

								var aptDate = new Date(apt.date),
										aptDate = aptDate.toLocaleDateString(),
										today = thisDate.toLocaleDateString();

								if(today==aptDate && apt.employee_id == employees[0].user_id ){
									apts.push([apt.schedule_block[0], apt.schedule_block[1]+apt.break_time]);
								}

							}

							var dateLoopDayFormated = thisDate.getDay()-1;

							if(dateLoopDayFormated<0){
								dateLoopDayFormated = 6
							}else if(dateLoopDayFormated>6){
								dateLoopDayFormated = 0;
							}
						

							var emplTempBlks = JSON.stringify(employees[0].schedule_block[dateLoopDayFormated].blocks);
									emplTempBlks = JSON.parse(emplTempBlks);


							out.push({apts: apts, emblk: emplTempBlks})

							sctemp = functionsTool.removeAppointmentFromSchedule(emplTempBlks, apts);

						}

						cb({schedule:sctemp, service:service, employees:employees});
		  			

		  		});


		  	});


			}catch(e){

				cb({err:"this service has no employee"});

			}

		});

	},


	getschedule_old: function(params, cb){

		var entrepriseId = params.entreprise_id,
				serviceId = params.service_id,
				employeeId = params.employee_id,
				// dayApmt = "2017-03-22";
				dayApmt = params.date;

		var employeeBaseSchedule = [], 
				employeeFinalSchedule = [], 
				employeeSchuduleTemp = [],
				appointmentSchedule = [],
				finalSchedule = [],
				serviceInfos = [],
				ducalm = [],
				com = [];

		var error = false;
		

		Entreprise.getbyid({
			id:entrepriseId
		}, function(err,entreprise){

			if(err) return cb({err:err});

  		if(!entreprise){  			        
        return cb({err:'invalid ..1'});
  		}

  		if(entreprise.length<=0){

  			error = true;
  			com.push("ERROR: entreprise not found");

  		}else{
		

				// get emplyoee and his schedul
				Employee.getbyids({
					user_id: employeeId,
					entreprise_id:entrepriseId
				}, function(err, employee){

		  		if(err) return cb({err:err});

		  		if(!employee){  					        
		        return cb({err:'invalid ..2'});
		  		}


		  		Service.getbyid({ // we need the service information such as duration and break time to create the final scheduale
						id: serviceId
					}, function(err, service){

			  		if(err) return cb({err:err});

			  		if(!service){  						        
			        return cb({err:'invalid ..3'});
			  		}	 


			  		// check if the employeeId can work on the service
			  		var employees_id = JSON.parse(service['employees_id']);			  		

			  		if( employees_id.indexOf(parseInt(employeeId)) == "-1"){
			  			return cb({err:"employee not alowed",com:com})
			  		}else{

				  		com.push(employees_id);


				  		if(typeof employee == 'object' && typeof employee['schedule']=='string'){

				  			// Get the emplyoeeSchedule
				  			var schedule = JSON.parse(employee['schedule']);

				  			// Get appointement of this emplyoee for the day asked
				  			Appointment.getbyidsdate({
				  				entreprise_id:entrepriseId,
				  				employee_id:employeeId,
				  				date:dayApmt,
				  				status: [3]
				  			}, function(err, appointment){

						  		if(err) return cb({err:err});

						  		if(!appointment){  									        
						        return cb({err:'invalid ..4'});
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


									
							  	return cb({
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
					  				serviceInfos:service,
					  				finalSchedule:finalSchedule
					  			})

						  	})


				  		}else{
				  			var err="employee not found";
				  			return cb({err:err})
				  		}

				  	}

			  	})

				})

			}

		})

	},


	getunanswered: function(params, cb){

		var entreprises = params.entreprises,
				user_id = params.user_id,
				finalApt = [],
				servicesId = [],
				com = [];


		functionsTool.getservicesofemployeeinallentreprise({employee_id:user_id, entreprises_id:entreprises.id_list},function(serv){


			for(si in serv){
				servicesId.push(serv[si].id);
			}

			if(serv.length>0){
				Appointment.find({
					where: { entreprise_id: entreprises.id_list },
					sort: 'id DESC'
					
				}).exec(function(err, apt){
			
					if(err){com.push({err: err})	}	
			
					for(var ai in apt){

						var auth = entreprises.auth[apt[ai].entreprise_id],
								addApt = false;

						if(auth.appointmentAll){				
							addApt = true;
						}

						if(auth.appointmentSelfService && servicesId.indexOf(apt.service_id) >= 0 ){
							addApt = true;
						}

						if(auth.appointementSelf && apt[ai].employee_id == user_id ){
							addApt = true;	
						}

						if(addApt){

							for(var si in serv){

								if(serv[si].id == apt[ai]['service_id']){
									apt[ai]['service_name'] = serv[si].name;
								}

							}

							if(apt[ai].status == 2){

								finalApt.push(apt[ai])

							}

						}

					}

					return cb(finalApt);

				})

			}else{

				return cb({err:'nothing found'});

			}

		})

	},

	getservicesofemployeeinallentreprise: function(params, cb){

		var employeeId = params.employee_id,
				entreprisesId = params.entreprises_id,
				services = [];


		Service.getbyentrepriseid({
			entreprise_id: entreprisesId
		}, function(err, serv){
			
			if(err){ com.push({err:err})}

			for(si in serv){

				var employee_list = JSON.parse(serv[si].employees_id);

				if(employee_list.indexOf(employeeId) >= 0 ){
					services[si] = serv[si];
				}

			}

			return cb(services)

		})

	},

	addNamesToAppointment: function(params, cb){

		var apt = params.apt;
		var com = [];
		


		var usersId = [], servicesId = [], entreprisesId = [];


		if(params.single){
			if(apt.customer_id!=0) usersId.push(apt.customer_id)
			usersId.push(apt.employee_id)
			servicesId.push(apt.service_id)
			entreprisesId.push(apt.entreprise_id)
		}else{

			for(var ai in apt){

				if(usersId.indexOf(apt[ai].customer_id) < 0 && apt[ai].customer_id!=0){
					usersId.push(apt[ai].customer_id)
				}
				if(usersId.indexOf(apt[ai].employee_id) < 0){
					usersId.push(apt[ai].employee_id)
				}
				if(servicesId.indexOf(apt[ai].service_id) < 0){
					servicesId.push(apt[ai].service_id)
				}
				if(entreprisesId.indexOf(apt[ai].entreprise_id) < 0){
					entreprisesId.push(apt[ai].entreprise_id)
				}

			}

		}

		User.find({id:usersId}).exec(function(err, usr){
			
			if(err){ cb({err:'no user found'	})}

			var users = {};

			for(var ui in usr){
				users[usr[ui].id] = usr[ui].name;
			}


			Service.find({id:servicesId}).exec(function(err, serv){
				
				if(err){ cb 	({err:'no service found'})}

				var services = {};

				for(var si in serv){
					services[serv[si].id] = serv[si].name;
				}


					Entreprise.find({id:entreprisesId}).exec(function(err, entr){

						if(err){ cb({err:'no entreprise found'})}

						var entreprises = {};

						for(var ei in entr){
							entreprises[entr[ei].id] = entr[ei].name;
						}

						if(params.single){

							if(apt.customer_id==0){
								try {
									var customerInfos = JSON.parse(apt.customer);
									apt.customer_name = customerInfos.name;
									apt.customer_surname = customerInfos.surname;
								}catch(e){console.log({xxeaaee:e})}
							}else{
								apt.customer_name = users[apt.customer_id];
							}
							apt.employee_name = users[apt.employee_id];
							apt.service_name = services[apt.service_id];
							apt.entreprise_name = entreprises[apt.entreprise_id];

						}else{

							for(var ai in apt){

								if(apt[ai]['customer_id']==0){

									console.log({tryToAdd:1})

	       					try {
	       						var customerInfos = JSON.parse(apt[ai]['customer']);
	       						apt[ai]['customer_name'] = customerInfos['name'];
	       						apt[ai]['customer_surname'] = customerInfos['surname'];
	       						console.log({tryToAdd:2})
	       					}catch(e){console.log({xxeerrore: e})};

								}else{
									apt[ai]['customer_name'] = users[ apt[ai]['customer_id'] ];
								}

								apt[ai]['employee_name'] = users[ apt[ai]['employee_id'] ];
								apt[ai]['service_name'] = services[ apt[ai]['service_id'] ];	
								apt[ai]['entreprise_name'] = entreprises[ apt[ai]['entreprise_id'] ]

							}

						}

						return cb(apt);

					})

			})

		})

	},

  appointmentAccepted: function(params, cb){

    var event = params.event;

    functionsTool.addNamesToAppointment({apt: event}, function(aptNamed){

    	Notification.create({
				user_id: event[0].customer_id,
				type: 'appointment_accepted',
				sub_infos: JSON.stringify(aptNamed[0]),
				seen: 0,
				pushed: 0
			}).exec(function(err, notif){
			
				if(err){ return err; }

				notificationService.tryToPushNotificationToUserId(event[0].customer_id, notif, function(result){

					console.log({ohoho: result});

					return cb({notif:notif});	

				})

			})

    })

  },

  appointmentRefused: function(params, cb){

    var event = params.event;

    functionsTool.addNamesToAppointment({apt: event}, function(aptNamed){

    	Notification.create({
				user_id: event[0].customer_id,
				type: 'appointment_refused',
				sub_infos: JSON.stringify(aptNamed[0]),
				seen: 0,
				pushed: 0
			}).exec(function(err, notif){
			
				if(err){ return err; }

				notificationService.tryToPushNotificationToUserId(event[0].customer_id, notif, function(result){

					console.log({ohoho: result});

					return cb({notif:notif});	

				})

			})

    })

  }




}