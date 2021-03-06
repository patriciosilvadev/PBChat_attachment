Template.accountBox.helpers
	myUserInfo: ->
		visualStatus = "online"
		username = Meteor.user()?.username
		switch Session.get('user_' + username + '_status')
			when "away"
				visualStatus = t("away")
			when "busy"
				visualStatus = t("busy")
			when "offline"
				visualStatus = t("invisible")
		return {
			name: Session.get('user_' + username + '_name')
			status: Session.get('user_' + username + '_status')
			visualStatus: visualStatus
			_id: Meteor.userId()
			username: username
		}

	showaway: ->
		user = Meteor.user()
		roles = user.roles
		isManager = roles.indexOf("livechat-manager")
		departmentname = localStorage.getItem('DepartmentName')
		isAdmin = localStorage.getItem('IsAdmin')
		IsService = departmentname.match('_Service')
		if isManager > -1 || isAdmin == "true"
			return true 
		else if IsService
			return false
		else
			return true

	isNotService: ->
		departmentname = localStorage.getItem('DepartmentName')
		IsService = departmentname.match('_Service')
		if IsService
			return false
		else 
			return true
	
	isNotMotor: ->
		departmentname = localStorage.getItem('DepartmentName')
		isNotMotor = departmentname.match('_Service')
		if departmentname == 'NewCar'
			return false
		else 
			return true
         
	showAdminOption: ->
		return RocketChat.authz.hasAtLeastOnePermission( ['view-statistics', 'view-room-administration', 'view-user-administration', 'view-privileged-setting' ]) or RocketChat.AdminBox.getOptions().length > 0

	registeredMenus: ->
		return AccountBox.getItems()

Template.accountBox.events
	'click .options .status': (event) ->
		event.preventDefault()
		AccountBox.setStatus(event.currentTarget.dataset.status)
		RocketChat.callbacks.run('userStatusManuallySet', event.currentTarget.dataset.status)

	'click .account-box': (event) ->
		AccountBox.toggle()

	'click #logout': (event) ->
		event.preventDefault()
		user = Meteor.user()
		Meteor.call 'checkOpenRoomBeforeLogout' ,  user._id, localStorage.getItem('DepartmentName'), (error, result) ->
			if result
				swal 'Close All Existing Chats before Logging out!'
				return false
			else
				Meteor.logout ->
					RocketChat.callbacks.run 'afterLogoutCleanUp', user
					Meteor.call('logoutCleanUp', user)
					Meteor.call('changeUserStatus', user._id)
					FlowRouter.go 'home'
				Meteor.call 'createLoginHistory' ,  user._id,localStorage.getItem('DepartmentName'),'logout'	

	'click #avatar': (event) ->
		FlowRouter.go 'changeAvatar'

	'click #account': (event) ->
		SideNav.setFlex "accountFlex"
		SideNav.openFlex()
		FlowRouter.go 'account'

	'click #admin': ->
		SideNav.setFlex "adminFlex"
		SideNav.openFlex()
		FlowRouter.go 'admin-info'

	'click .account-link': (event) ->
		event.stopPropagation();
		event.preventDefault();
		AccountBox.openFlex()

	'click .account-box-item': ->
		if @sideNav?
			SideNav.setFlex @sideNav
			SideNav.openFlex()

Template.accountBox.onRendered ->
	AccountBox.init()
