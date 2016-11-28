Template.livechatCurrentChats.helpers({
	livechatRoom() {
		if(localStorage.getItem('IsAdmin') == "true"){
			return ChatRoom.find({ t: 'l'}, { sort: { ts: -1 } });	
		}
		else{
			department = localStorage.getItem('DepartmentId');
			return ChatRoom.find({ t: 'l',department: department }, { sort: { ts: -1 } });
		}
	},
	startedAt() {
		return moment(this.ts).format('L LTS');
	},
	ActiveSince() {
		if(this.open){
			return moment(this.ts).fromNow();
		}
		else{
			return '';
		}
	},
	lastMessage() {
		return moment(this.lm).format('L LTS');
	},
	servedBy() {
		return this.servedBy && this.servedBy.username;
	},
	status() {
		return this.open ? t('Opened') : t('Closed');
	},
	agents() {
		return AgentUsers.find({}, { sort: { name: 1 } });
	},
	blocked() {		
		if(BlockedVisitor.find({_id:this.v._id,blocked:true}).fetch().length === 0){
			return 'Block';
		}
		else{
			return 'Unblock';
		}

	}
	
	// Meteor.users.find({}).fetch()
});


Template.livechatCurrentChats.events({
	'click .row-link'() {
		FlowRouter.go('live', { code: this.code });
	},
	'click .load-more'(event, instance) {
		instance.limit.set(instance.limit.get() + 20);
	},
	'submit form'(event, instance) {
		event.preventDefault();

		let filter = {};
		$(':input', event.currentTarget).each(function() {
			if (this.name) {				
				filter[this.name] = $(this).val();
			}
		});
		instance.filter.set(filter);
		instance.limit.set(20);
	},
	'click .block-customer'(){
		var Isblock = false;		
		var customerblockstatus = document.getElementsByClassName("block-customer")[0].textContent;	
		if(customerblockstatus === 'Unblock'){
			Isblock = false;
		}
		else{
			Isblock = true;
		}
		Meteor.call('livechat:blocklivechatcustomer', this.v._id,Isblock, function(error/*, result*/) {
			if (error) {
				return handleError(error);
			}
			else{
				if(Isblock){
					alert('Customer has been blocked');
				}
				else{
					alert('Customer has been unblocked');
				}
			}
		});
	}
});

Template.livechatCurrentChats.onCreated(function() {
	this.limit = new ReactiveVar(20);
	this.filter = new ReactiveVar({});
	this.blockedlist = new ReactiveVar();

	this.subscribe('livechat:agents');
	this.subscribe('livechat:BlockedVisitor');

	this.autorun(() => {
		// instance.blockedlist.set(Meteor.users.find({}).fetch()); 
		this.subscribe('livechat:rooms', this.filter.get(), 0, this.limit.get());
	});
});
