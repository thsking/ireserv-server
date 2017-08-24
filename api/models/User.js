/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    id: { type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },

    name : { type: 'string'},
    firstname : { 
      type: 'string',
      defaultsTo: ''
    },

    email : { type: 'string'},
    password : { type: 'string'},

    type: {
      type: 'string',
      defaultsTo: 'normal'
    },

    createdAt : { type: 'date' }, 
    updatedAt : { type: 'date' }
    
  },


  getbyid: function(inputs, cb){
    User.findOne({
      id:inputs.id
    }).exec(cb);
  },

  signup: function (inputs, cb) {
    // Create a user
    User.create({
      name: inputs.name,
      firstname: inputs.firstname,
      email: inputs.email,
      // TODO: But encrypt the password first
      password: inputs.password
    })
    .exec(cb);
  },


  attemptLogin: function (inputs, cb) {
    // Create a user
    User.findOne({
      email: inputs.email,
      // TODO: But encrypt the password first
      password: inputs.password
    })
    .exec(cb);
  },


};

