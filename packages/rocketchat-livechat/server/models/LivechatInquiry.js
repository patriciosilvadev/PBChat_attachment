class LivechatInquiry extends RocketChat.models._Base {
    constructor() {
        super('livechat_inquiry');

        this.tryEnsureIndex({ 'rid': 1 }); // room id corresponding to this inquiry
        // this.tryEnsureIndex({ 'name': 1 }); // name of the inquiry (client name for now)
        // this.tryEnsureIndex({ 'message': 1 }); // message sent by the client
        // this.tryEnsureIndex({ 'ts': 1 }); // timestamp
        // this.tryEnsureIndex({ 'code': 1 }); // (for routing)
        this.tryEnsureIndex({ 'agents': 1 }); // Id's of the agents who can see the inquiry (handle departments)
        this.tryEnsureIndex({ 'status': 1 }); // 'open', 'taken'
    }

    findOneById(inquiryId) {
        return this.findOne({ _id: inquiryId });
    }

    getEnquiryByRoomId(rid) {
        return this.findOne({ rid: rid }, { sort: { ts: -1 } });
    }

    takeInquiry(inquiryId) {
        this.update({
            '_id': inquiryId
        }, {
            $set: { status: 'taken' }
        });
    }

    takeInquiryByRid(rid) {
        this.update({
            'rid': rid
        }, {
            $set: { status: 'taken' }
        });
    }

    /*
     * mark inquiry as open
     */
    openInquiry(inquiryId) {
        this.update({
            '_id': inquiryId
        }, {
            $set: {
                status: 'open'
            }
        });
    }
    openInquiryAndUpadteAgents(inquiryId, agentIds) {
            this.update({
                '_id': inquiryId
            }, {
                $set: {
                    status: 'open',
                    agents: agentIds
                }
            });
        }
        /*
         * return the status of the inquiry (open or taken)
         */
    getStatus(inquiryId) {
        return this.findOne({ '_id': inquiryId }).status;
    }
}

RocketChat.models.LivechatInquiry = new LivechatInquiry();