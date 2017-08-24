/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    id: { 
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    entreprise_id: { type: 'integer'},
    employees_id: { type: 'string'},
    name : { type: 'string'},
    description_short: { type: 'string'},
    description_long: { type: 'string'},
    price: { type: 'string'},
    duration: { type: 'integer'},
    at_home: {type: 'integer'},
    break_time: {type: 'integer'},
    many_customer: {type: 'integer'},
    last_minute_max: {type: 'integer'},
    precision_label: {type: 'string'},
    actif: {
      type: 'integer',
      defaultsTo : '1'
    },
    createdAt : { type: 'date' }, 
    updatedAt : { type: 'date' }
    
  },

  getbyid: function (inputs, cb) {
    Service.findOne({
      id: inputs.id
    })
    .exec(cb);
  },

  getbyentrepriseid: function(inputs, cb){
    Service.find({
      entreprise_id: inputs.entreprise_id
    }).exec(cb)
  },


  getall: function(cb){
    Service.find().exec(cb);
  },


  getbyentrepriseidandname: function(inputs, cb){
    Service.find({
      entreprise_id: inputs.entreprise_id,
      name: inputs.name
    }).exec(cb)
  },


 /* update:function(inputs, cb){
    Service.update({
      entreprise_id: inputs.entrepriseId,
      service_id: inputs.serviceId
    }, {description_short: inputs.description_short}).exec(cb)
  }*/


};

