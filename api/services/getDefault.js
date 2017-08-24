module.exports = {

	authorization: function(){

		return {
			"appointementAdd":true,
			"appointementSelf":true,
			"appointmentSelfService":false,
			"appointmentAll":false,
			"employeeAdd":false,
			"employeeEdit":false,
			"employeeRemove":false,
			"employeeSetService":false,
			"employeeRemoveService":false,
			"serviceCreate":false,
			"serviceEdit":false,
			"general_info":false
		};

	},

	schedule: function(){

		return {
			"monday":{

				"morning":{"start":"","end":""},
				"afternoon":{"start":"","end":""}

			},

			"tuesday":{

				"morning":{"start":"","end":""},
				"afternoon":{"start":"","end":""}

			},

			"wednesday":{

				"morning":{"start":"","end":""},
				"afternoon":{"start":"","end":""}

			},

			"thursday":{

				"morning":{"start":"","end":""},
				"afternoon":{"start":"","end":""}

			},

			"friday":{

				"morning":{"start":"","end":""},
				"afternoon":{"start":"","end":""}

			},

			"saturday":{

				"morning":{"start":"","end":""},
				"afternoon":{"start":"","end":""}

			},

			"sunday":{

				"morning":{"start":"","end":""},
				"afternoon":{"start":"","end":""}

			}
		}

	}

}