// Every minute check if office closed
Meteor.setInterval(function() {
	// if (RocketChat.settings.get('Livechat_enable_office_hours')) {
	// 	if (RocketChat.models.LivechatOfficeHour.isOpeningTime()) {
	// 		RocketChat.models.Users.openOffice();
	// 	} else if (RocketChat.models.LivechatOfficeHour.isClosingTime()) {
	// 		RocketChat.models.Users.closeOffice();
	// 	}
	// }
	var departments = RocketChat.models.LivechatDepartment.find();
	departments.forEach((department) => {
		if (RocketChat.settings.get('Livechat_Agent_LogoutTime_'+ department.name)) {
			var Islogout = null;
			var closingtime = RocketChat.settings.get('Livechat_Agent_LogoutTime_' + department.name);
			Meteor.call('livechat:isLogoutTime', closingtime,(err, result) => {     
				if (err) {
					console.error(err);
				} else {
					Islogout = result;              
				}
			});
			if (Islogout) {
				console.log( 'Cron run for ' + department.name );
				var agents = RocketChat.models.LivechatDepartmentAgents.findByDepartmentId(department._id).fetch();
				RocketChat.models.Users.logoutDayend(_.pluck(agents, 'agentId'));
				RocketChat.models.LivechatDepartmentAgents.updateLivechatCountAtDayend(department._id);
			}
	    }
	});
}, 60000);