//new method added by PBChat
Meteor.methods({
    'livechat:getFilteredCount' (filter, isAdmin = null) {
        this.unblock();
        //Changes by PBChat
        check(filter, {
            name: Match.Maybe(String), // room name to filter
            leadid: Match.Maybe(String), // leadid name to filter//Changes by PBChat
            agent: Match.Maybe(String), // agent _id who is serving
            status: Match.Maybe(String), // either 'opened' or 'closed'
            From: Match.Maybe(String),
            To: Match.Maybe(String),
            department: Match.Maybe(String),
            waitingResponse: Match.Maybe(String)
        });
        var departmentlist = null;
        if (isAdmin && isAdmin == "false") {
            Meteor.call('livechat:getAgentDepartments', this.userId, (err, result) => {
                if (result) {
                    departmentlist = result;
                }
            });
        }
        let query = {};
        if (filter.name) {
            query.label = new RegExp(filter.name, 'i');
        }
        //Changes by PBChat
        if (filter.leadid) {
            query['leadid'] = Number(filter.leadid);
        }
        if (filter.agent) {
            query['servedBy._id'] = filter.agent;
        }
        if (filter.status) {
            if (filter.status === 'opened') {
                query.open = true;
            } else {
                query.open = { $exists: false };
            }
        }

        if (filter.name || filter.leadid) {
            var notimefilter = true;
        } else if (filter.From && filter.To) {
            var StartDate = new Date(filter.From);
            var EndDate = new Date(filter.To);
            query["ts"] = { $gte: StartDate, $lte: EndDate };
        } else if (filter.From) {
            var StartDate = new Date(filter.From);
            query["ts"] = { $gte: StartDate };
        }
        if (filter.department) {
            query["department"] = filter.department;
        } else if (isAdmin == "true") {
            var response = "admin";
        } else if (departmentlist) {
            query["department"] = { $in: departmentlist };
        }

        if (filter.waitingResponse == "true") {
            query["waitingResponse"] = true;
        } else if (filter.waitingResponse == "false") {
            query["waitingResponse"] = null;
        }
        return RocketChat.models.Rooms.findLivechatCount(query);
    }
});