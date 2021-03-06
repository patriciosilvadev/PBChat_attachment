Template.chatRoomItem.helpers

	alert: ->
		if FlowRouter.getParam('_id') isnt this.rid or not document.hasFocus() 
			return this.alert

	unread: ->
		if (FlowRouter.getParam('_id') isnt this.rid or not document.hasFocus()) and this.unread > 0
			return this.unread

	userStatus: ->
		return 'status-' + (Session.get('user_' + this.name + '_status') or 'offline')

	inqury: ->
		if this.status == 'open'
			return true
		else 
			return false

	name: ->
		room = ChatRoom.findOne({_id : this.rid})
		if room && room.waflag && room.waflag == 1 && room.mobile
			return room.mobile
		else
			return this.name
		
	
	hideEye: ->
		room = ChatRoom.findOne({_id : this.rid})
		if room && room.open == true
			return false
		else
			return true

	roomIcon: ->
		return RocketChat.roomTypes.getIcon this.t

	active: ->
		if Session.get('openedRoom') is this.rid
			return 'active'

	canLeave: ->
		roomData = Session.get('roomData' + this.rid)

		return false unless roomData

		if (roomData.cl? and not roomData.cl) or roomData.t is 'd' or (roomData.usernames?.indexOf(Meteor.user().username) isnt -1 and roomData.usernames?.length is 1)
			return false
		else
			return true

	route: ->
		return RocketChat.roomTypes.getRouteLink @t, @

	archived: ->
		return if this.archived then 'archived'

	#Added by PBChat for online user count
	onlineUsers: ->
 		if Meteor.user()?.settings?.preferences?.showOnlineUsers
 			onlineUsers = RoomManager.onlineUsers.get()
 			room = ChatRoom.findOne(this.rid)
 			roomUsernames = room?.usernames or []
 			roomOnlineUsernames = roomUsernames.filter((username) -> onlineUsers[username])
 			totalOnline = roomOnlineUsernames.length
			return totalOnline
	#Added by PBChat for online user count


Template.chatRoomItem.rendered = ->
	if not (FlowRouter.getParam('_id')? and FlowRouter.getParam('_id') is this.data.rid) and not this.data.ls and this.data.alert is true
		KonchatNotification.newRoom(this.data.rid)

Template.chatRoomItem.events

	'click .open-room': (e) ->
		menu.close()

	'click .hide-room': (e) ->
		e.stopPropagation()
		e.preventDefault()

		rid = this.rid
		name = this.name

		warnText = switch this.t
			when 'c' then 'Hide_Room_Warning'
			when 'p' then 'Hide_Group_Warning'
			when 'd' then 'Hide_Private_Warning'

		swal {
			title: t('Are_you_sure')
			text: if warnText then t(warnText, name) else ''
			type: 'warning'
			showCancelButton: true
			confirmButtonColor: '#DD6B55'
			confirmButtonText: t('Yes_hide_it')
			cancelButtonText: t('Cancel')
			closeOnConfirm: true
			html: false
		}, ->
			if FlowRouter.getRouteName() in ['channel', 'group', 'direct'] and Session.get('openedRoom') is rid
				FlowRouter.go 'home'

			Meteor.call 'hideRoom', rid, (err) ->
				if err
					handleError(err)
				else
					if rid is Session.get('openedRoom')
						Session.delete('openedRoom')

	'click .leave-room': (e) ->
		e.stopPropagation()
		e.preventDefault()

		rid = this.rid
		name = this.name

		warnText = switch
			when this.t == 'c' then 'Leave_Room_Warning'
			when this.t == 'p' then 'Leave_Group_Warning'
			when this.t == 'd' then 'Leave_Private_Warning'
		swal {
			title: t('Are_you_sure')
			text: t(warnText, name)
			type: 'warning'
			showCancelButton: true
			confirmButtonColor: '#DD6B55'
			confirmButtonText: t('Yes_leave_it')
			cancelButtonText: t('Cancel')
			closeOnConfirm: false
			html: false
		}, (isConfirm) ->
			if isConfirm
				Meteor.call 'leaveRoom', rid, (err) ->
					if err
						swal {
							title: t('Warning')
							text: handleError(err, false)
							type: 'warning'
							html: false
						}

					else
						swal.close()
						if FlowRouter.getRouteName() in ['channel', 'group', 'direct'] and Session.get('openedRoom') is rid
							FlowRouter.go 'home'

						RoomManager.close rid
			else
				swal.close()
