/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view eng1ne) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/


  'get /notiff/:registration_token':"NotificationController.pushit",

  'get /user_connected/getusers':"User_ConnectedController.getusers",

  'post /user_connected/push/login':'User_ConnectedController.pushlogin',

  'post /user/register':"UserController.signup",
  'post /user/login': 'UserController.login',
  'get /user/logout': 'UserController.logout',

  'get /user/getbytoken': 'UserController.getbytoken',
  'get /user/:id':'UserController.getbyid',
  'get /user/search/:search':'UserController.search',

  'get /service/all': 'ServiceController.getall',
  'get /service/id/:id(\\d+)': 'ServiceController.getbyid',
  'get /service/id/:id/remove': 'ServiceController.remove',
  'get /entreprise/:id(\\d+)/services': 'ServiceController.getbyentrepriseid',

  'get /entreprise/all' : 'EntrepriseController.getall',
  'get /entreprise/:id': 'EntrepriseController.getbyid',
  'get /entreprise/search/:search': 'EntrepriseController.search',
  'get /entreprise/:entreprise_id(\\d+)/employee/:user_id(\\d+)': 'EmployeeController.getbyids',
  'get /entreprise/:entreprise_id(\\d+)/employees/':'EmployeeController.getbyentrepriseid',

  'post /entreprise/:entreprise_id(\\d+)/service/:service_id(\\d+)/update': 'ServiceController.update',
  'post /entreprise/:entreprise_id(\\d+)/service/create': 'ServiceController.create',
  'post /entreprise/:entreprise_id(\\d+)/employee/:employee_id(\\d+)/update/schedule': 'EmployeeController.updateschedule',
  'post /entreprise/:entreprise_id(\\d+)/employee/:employee_id(\\d+)/update/authorization': 'EmployeeController.updateauthorization',
  'post /entreprise/:entreprise_id(\\d+)/employee/create':'EntrepriseController.createemployee',
  'post /entreprise/create':'EntrepriseController.create',
  'get /entreprise/:entreprise_id(\\d+)/employee/add/:user_id(\\d+)':'EntrepriseController.addemployee',
  'post /entreprise/:entreprise_id(\\d+)/saveservicesfavorits': 'EntrepriseController.saveservicesfavorits',
  'post /entreprise/:entreprise_id(\\d+)/updateinfos': 'EntrepriseController.updateinfos',
  'get /entreprise/:entreprise_id(\\d+)/remove': 'EntrepriseController.remove',

  'get /employee/:user_id(\\d+)': 'EmployeeController.getById',

  'get /category/all' : 'CategoryController.getall',


  'get /domaine/all' : 'DomaineController.getall',
  'get /domaine/:id(\\d+)': 'CategoryController.getbydomaineid',
  'get /domaine/:domaine_id(\\d+)/category/:category_id(\\d+)':'EntrepriseController.getbydomcatid',


  'get /schedule/entreprise/:entreprise_id(\\d+)/service/:service_id(\\d+)/employee/:employee_id(\\d+)/date/:date':'AppointmentController.getschedule',
  'get /schedule/entreprise/:entreprise_id(\\d+)/service/:service_id(\\d+)/employees/:employees_id/date/:date':'AppointmentController.getentrepriseserviceschedule',

  'post /appointment/create/entreprise/:entreprise_id(\\d+)/service/:service_id(\\d+)/employee/:employee_id(\\d+)/customer/:customer_id(\\d+)/date/:date/minute/:minute(\\d+)':'AppointmentController.create',
  'get /appointment/create/entreprise/:entreprise_id(\\d+)/service/:service_id(\\d+)/employee/:employee_id(\\d+)/customer/:customer_id(\\d+)/date/:date/minute/:minute(\\d+)':'AppointmentController.create',
  'get /appointment/get/year/:year(\\d+)/month/:month(\\d+)': 'AppointmentController.getmonth',
  'get /appointment/get/unanswered':'AppointmentController.getunanswered',
  'get /appointment/get/entreprise/:entreprise(\\d+)/date/:date':'AppointmentController.getbyentrepriseid',
  'get /appointment/get/id/:id(\\d+)':'AppointmentController.getbyid',
  'get /appointment/accept/:appointment_id(\\d+)':'AppointmentController.accept',
  'get /appointment/refuse/:appointment_id(\\d+)':'AppointmentController.refuse',

  'get /notification/all':'NotificationController.getall',
  'get /notification/user/:user_id(\\d+)':'NotificationController.getByUserId',
  'get /notification/:notification_id/seen':'NotificationController.seen',

  'get /testroot':'ServiceController.testest',


  'get /bugsreport/create':'BugsreportController.create',

  // 'get /user': 'UserController.add',  
  // 'post /try': {
  //   controller: 'UserController',
  //   action: 'try'/*,
  //   cors:'*'*/
  // },
  // 'post /user': "UserController.logout",


};
