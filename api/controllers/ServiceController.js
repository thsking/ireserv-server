/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var jwt = require('jsonwebtoken');
module.exports = {

	getall: function(req,res){

		Service.getall(function(err, service){
  		if(err) return res.negotiate(err);
  		if(!service){  			
        if (req.wantsJSON) {
          // return res.badRequest('Invalid username/password combination.');
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}
  		return res.json({service:service})
		})

	},

  getbyid: function(req,res){

    var reqid = req.param('id');

    Service.getbyid({
      id: reqid
    }, function(err, service){
      if(err) return res.negotiate(err);
      if(!service){       
        if (req.wantsJSON) {
          // return res.badRequest('Invalid username/password combination.');
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
      }
      return res.json({service:service})
    })

  },

	getbyentrepriseid: function(req,res){

		var reqid = req.param('id');

  	Service.getbyentrepriseid({
  		entreprise_id: reqid
  	}, function(err, service){
  		if(err) return res.negotiate(err);
  		if(!service){  			
        if (req.wantsJSON) {
          // return res.badRequest('Invalid username/password combination.');
          return res.json({error:"invalid"})
        }
        return res.json({message:'invalid'});
  		}
  		return res.json({service:service})
  	})

	},

  update: function(req,res){

    var entrepriseId = req.param('entreprise_id'),
        serviceId = req.param('service_id'),
        infos = JSON.parse(req.param('out')),
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
        if (!user) {return res.json({user:"user not connected"});}
        // Otherwise save the user object on the request (i.e. "log in") and continue


        // get employee info
        Employee.getbyids({
          user_id: user.id,
          entreprise_id: entrepriseId
        }, function(err, employee){

          if(err) return res.negotiate(err);
          if(!employee){       
            if (req.wantsJSON) {
              // return res.badRequest('Invalid username/password combination.');
              return res.json({error:"no employee"})
            }
            return res.json({message:'no employee'});
          }

          try {
            var employeeAuth = JSON.parse(employee.authorization);

            if(employeeAuth['serviceEdit']){
              
              /*Service.update({
                entreprise_id: entrepriseId,
                service_id: serviceId,
                description_short: req.param('description_short')
              }, function(err, service){

                if(err) return res.negotiate(err);
                if(!service){       
                  if (req.wantsJSON) {
                    // return res.badRequest('Invalid username/password combination.');
                    return res.json({error:"no service"})
                  }
                  return res.json({message:'no service'});
                }

                com.push('service updated');

              })*/


              Service.update({
                id:serviceId
              }, {
                employees_id:infos['employees_id'],
                name :infos['name'],
                description_short:infos['description_short'],
                description_long:infos['description_long'],
                price:infos['price'],
                duration:infos['duration'],
                at_home:infos['at_home'],
                break_time:infos['break_time'],
                many_customer:infos['many_customer'],
                last_minute_max:infos['last_minute_max'],
                precision_label:infos['precision_label']         
              }).exec( function(err){
                if(err){
                  com.push({error:err})
                }else{
                  com.push('OKKKKKKKX.')
                }

              });

            }

          }catch(e){
            res.json({errCatched: e});
          }

          return res.json({employeeAuth:employeeAuth,com:com})

        })

        // return res.json({user:user});
      });

    });     

  },



  create: function(req,res){

    var entrepriseId = req.param('entreprise_id'),
        infos = JSON.parse(req.param('out')),
        serviceNameExist = false,
        serviceCreated = false,
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
          entreprise_id: entrepriseId
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

          if(employeeAuth['serviceCreate']){


            // verify if the service name doesn't exist on the entreprise
             Service.getbyentrepriseidandname({
              entreprise_id:1,
              name: infos['name']
            }, function(err, srvvv){

              if(err) return res.negotiate(err);
              if(srvvv.length>0){
                serviceNameExist = true;
              }else{

                serviceCreated = true;

                for(n in infos){

                  if(n=='entreprise_id'){ infos[n] = entrepriseId; }
                  if(n=="price"||n=="duration"||n=="at_home"||n=="break_time"||n=="many_customer"||n=="last_minute_max"){
                    if(!infos[n]){
                      infos[n]=0;
                    }
                  }

                }

                Service.create({
                  entreprise_id: infos['entreprise_id'],
                  employees_id:infos['employees_id'],
                  name :infos['name'],
                  description_short:infos['description_short'],
                  description_long:infos['description_long'],
                  price:infos['price'],
                  duration:infos['duration'],
                  at_home:infos['at_home'],
                  break_time:infos['break_time'],
                  many_customer:parseInt(infos['many_customer']),
                  last_minute_max:parseInt(infos['last_minute_max']),
                  precision_label:infos['precision_label']         
                }).exec( function(err, newService){

                  if(err){  return res.serverError(err); }
                  com.push({newService:newService})

                  console.log({newS:newService});

                });

              }

              

              if(serviceCreated){
                return res.json({success:'service created'})
              }else{
                return res.json({error:'service name exist'})
              }

            })        

          }


        })

      });

    }); 

  },

  remove: function(req, res){

    var serviceId = req.param('id');

    var token = req.header('authorization');
    /*token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE0OTQ4NDY3MTAsImV4cCI6MTQ5NDkzMzExMH0.zOH4EfgPS6E4uKCHuDDNy29xdiCWcveBbKFZl-wtvEs";*/

    // If there's nothing after "Bearer", just redirect to login
    if (!token) {return res.json({user:"user not connected"});}

    // If there is something, attempt to parse it as a JWT token
    return jwt.verify(token, sails.config.jwtSecret, function(err, payload) {

      // If there's an error verifying the token (e.g. it's invalid or expired),
      // redirect to the login page.
      if (err) {return res.json({user:"user not connectxed", err:err});}
      
      // If there's no user ID in the token, redirect to login
      if (!payload.user) {return res.json({user:""});}
      // Otherwise try to look up that user
      User.findOne(payload.user, function(err, user) {
        if (err) {return res.negotiate(err);}
        // If the user can't be found, redirect to the login page
        if (!user) {return res.json({error:"user not connectexd"});}
        // Otherwise save the user object on the request (i.e. "log in") and continue

        Service.find({id:serviceId}).exec(function(err, srv){
          
          if(err){res.json({err:err})}

          Employee.find({user_id: user.id, entreprise_id: srv[0].entreprise_id}).exec(function(err, empl){

            if(err){res.json({err:err})}

            var canRemove = false;

            empl = empl[0];
            empl.authorization = JSON.parse(empl.authorization);

            if(empl.authorization.serviceEdit){
              canRemove = true;
            }

            if(canRemove){

              Service.destroy({
                id: serviceId
              }).exec(function(err){

                if(err){return res.negotiate(err)}
                res.json('record removed');
              
              })

            }

          })

        })
        
      })

    })
    
  },

  testest: function(req, res){

              Service.find({id: 33}).exec(function(err, srv){
                if(err){return res.serverError(err)}
                // res.json('record removed');
                res.json(srv);
              })

  }

}