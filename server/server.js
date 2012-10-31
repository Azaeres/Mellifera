var d_ = function(str) {
  if (typeof console !== 'undefined')
    console.log(str);
};

Accounts.config({
	sendVerificationEmail:true,
	forbidClientAccountCreation:false
});

TimeAccounts = new Meteor.Collection('TimeAccounts');

Meteor.methods({
	GetUserTimeAccountId: function() {
	  var userId = this.userId;
		var acctId;

	  if (userId !== null) {
		  var acct = TimeAccounts.findOne({owner:userId});

		  if (typeof acct === 'undefined') {
		    acctId = TimeAccounts.insert({owner:userId, credit:0, debt:0, dividends:0});
		  }
		  else {
		  	if (typeof acct._id !== 'undefined')
			  	acctId = acct._id;
		  }
	  }

		return acctId;
	}
});

Meteor.publish('TimeAccounts', function () {
		return TimeAccounts.find({});
});
