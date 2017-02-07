Template.livechatCurrentChats.helpers({
    livechatRoom() {
        if (localStorage.getItem('IsAdmin') == "true") {
            return ChatRoom.find({ t: 'l' }, { sort: { ts: -1 } });
        } else {
            department = localStorage.getItem('DepartmentId');
            return ChatRoom.find({ t: 'l', department: department }, { sort: { ts: -1 } });
        }
    },
    startedAt() {
        return moment(this.ts).format('L LTS');
    },
    ActiveSince() {
        if (this.open) {
            return moment(this.ts).fromNow();
        } else {
            return '';
        }
    },
    lastMessage() {
        return moment(this.lm).fromNow();
    },
    servedBy() {
        return this.servedBy && this.servedBy.username;
    },
    status() {
        return this.open ? t('Close') : t('Closed');
    },
    agents() {
        if (localStorage.getItem("IsAdmin") == "true") {
            return AgentUsers.find({}, { sort: { name: 1 } });
        } else {
            return LivechatDepartmentAgents.find({}, { sort: { name: 1 } });
        }
    },
    IsAdmin() {
        if (localStorage.getItem("IsAdmin") == "true") {
            return true;
        } else {
            return false;
        }
    },
    pickupTime() {
        if (this.responseTime) {
            return Math.round(this.responseTime);
        } else {
            return '';
        }
    },
    blocked() {
        //if(BlockedVisitor.find({_id:this.v._id,blocked:true}).fetch().length === 0){
        return 'Block';
        //}
        //else{
        //	return 'Unblock';
        //}
    },
    isOpen() {
        return this.open;
    }
});


Template.livechatCurrentChats.events({
    'click .row-link' () {
        FlowRouter.go('live', { code: this.code });
    },
    'click .load-more' (event, instance) {
        instance.limit.set(instance.limit.get() + 20);
    },
    'submit form' (event, instance) {
        event.preventDefault();

        let filter = {};
        $(':input', event.currentTarget).each(function() {
            if (this.name) {
                filter[this.name] = $(this).val();
            }
        });
        instance.filter.set(filter);
        instance.limit.set(20);
        //Method Call for count
    },
    'click .block-customer' () {
        var Isblock = false;
        var customerblockstatus = document.getElementsByClassName("block-customer")[0].textContent;
        if (customerblockstatus === 'Unblock') {
            Isblock = false;
        } else {
            Isblock = true;
        }
        Meteor.call('livechat:blocklivechatcustomer', this.v._id, Isblock, function(error /*, result*/ ) {
            if (error) {
                return handleError(error);
            } else {
                if (Isblock) {
                    alert('Customer has been blocked');
                } else {
                    alert('Customer has been unblocked');
                }
            }
        });
    },
    'click .close-livechat' (event) {
        event.preventDefault();

        swal({
            title: t('Closing_chat'),
            type: 'input',
            inputPlaceholder: t('Please_add_a_comment'),
            showCancelButton: true,
            closeOnConfirm: false
        }, (inputValue) => {
            if (!inputValue) {
                swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
                return false;
            }

            if (s.trim(inputValue) === '') {
                swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
                return false;
            }
            console.log(this._id);
            Meteor.call('livechat:closeRoom', this._id, inputValue, function(error /*, result*/ ) {
                if (error) {
                    return handleError(error);
                }
                swal({
                    title: t('Chat_closed'),
                    text: t('Chat_closed_successfully'),
                    type: 'success',
                    timer: 1000,
                    showConfirmButton: false
                });
            });
        });
    }
});

Template.livechatCurrentChats.onCreated(function() {
    this.limit = new ReactiveVar(20);
    this.filter = new ReactiveVar({});
    this.blockedlist = new ReactiveVar();
    this.subscribe('livechat:agents');
    this.subscribe('livechat:departmentAgents', localStorage.getItem("DepartmentId"));
    //this.subscribe('livechat:BlockedVisitor');

    this.autorun(() => {
        if (localStorage.getItem('IsAdmin') === "false") {
            let filter1 = {};
            filter1['department'] = localStorage.getItem('DepartmentId');
            this.filter.set(filter1);
        }
        this.subscribe('livechat:rooms', this.filter.get(), 0, this.limit.get());
    });
});

Template.livechatCurrentChats.onRendered(function() {
    $('#datetimepicker6').datetimepicker();
    $('#datetimepicker7').datetimepicker({
        useCurrent: false //Important! See issue #1075
    });
    $("#datetimepicker6").on("dp.change", function(e) {
        $('#datetimepicker7').data("DateTimePicker").minDate(e.date);
    });
    $("#datetimepicker7").on("dp.change", function(e) {
        $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);
    });
});