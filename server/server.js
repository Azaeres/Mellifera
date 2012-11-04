var d_ = function(str) {
  if (typeof console !== 'undefined')
    console.log(str);
};

Accounts.config({
	sendVerificationEmail:true,
	forbidClientAccountCreation:false
});

Meteor.publish('TimeAccounts', function () {
		return TimeAccounts.find({});
});

TimeAccounts = new Meteor.Collection('TimeAccounts');

Helpers = {
	/***********************************************************************************
	 * Returns the universal liability limit.
	 * Returns null if it hasn't been set.
	 */
	liabilityLimit: function() {
		var sharedAcct = TimeAccounts.findOne({owner:null});
		var liabilityLimit = null;
		if (typeof sharedAcct !== 'undefined') {
			liabilityLimit = sharedAcct.liabilityLimit;
		}

		return liabilityLimit;
	},
	/***********************************************************************************
	 * Returns the time account for the logged-in user.
	 * 
	 * Returns null if the user isn't logged in.
	 * If the logged-in user doesn't have a time account yet, one is created.
	 */
	userTimeAccount: function() {
	  var acct;
	  var userId = Meteor.userId();

	  if (typeof userId !== 'undefined' && userId !== null) {
	  	acct = TimeAccounts.findOne({owner:userId});
		  if (typeof acct === 'undefined') {
		    acctId = TimeAccounts.insert({owner:userId, credit:0, debt:0, dividends:0});
		    acct = TimeAccounts.findOne({_id:acctId});
		  }
	  }

	  return acct;
	},
	/***********************************************************************************
	 * Returns the time account id for the logged-in user.
	 * 
	 * Returns null if the user isn't logged in.
	 * If the logged-in user doesn't have a time account yet, one is created.
	 */
	userTimeAccountId: function() {
		var acctId;
		var acct = h_.userTimeAccount();

		if (typeof acct !== 'undefined' && acct !== null) {
			acctId = acct._id;
		}

		return acctId;
	},
  wipeAccount: function() {
    var userId = Meteor.userId();
    if (typeof userId !== 'undefined') {
      TimeAccounts.update({ owner:userId }, { $set:{ credit:0, debt:0, dividends:0 }});
    }

    return 'Account wiped.'
  }
};
h_ = Helpers;

Meteor.methods({
	UserTimeAccountId: function() {
	  return h_.userTimeAccountId();
	},
	LiabilityLimit: function() {
		return h_.liabilityLimit();
	},
	WipeAccount: function() {
		return h_.wipeAccount();
	},
	/******************************************************
	 * Clients report contributions of time to the server.
	 * 
	 * Generates a given amount of credit, backed by debt, in the logged-in user's account.
	 * Leaves a balance of credit and debt in the system.
	 * 
	 * Checks for the liability limit before applying.
	 */
	ReportContribution: function(amount) {
		var result = 0;
		var liabilityLimit = h_.liabilityLimit();
		
		if (liabilityLimit !== null) {
		  var userId = this.userId;
		  if (userId !== null) {
				var acct = h_.userTimeAccount();

				if (acct !== null) {
					var availableDebt = liabilityLimit - acct.debt;
					var remaining = availableDebt - amount;

					if (remaining < 0) {
						remaining = Math.abs(remaining);
						amount -= remaining;
					}

					TimeAccounts.update({ _id:acct._id }, { $inc:{ credit:amount, debt:amount } });
					result = amount;
				}
				else
					throw new Meteor.Error(500, 'No time account found for user.');
		  }
			else
				throw new Meteor.Error(500, 'User not logged in.');
		}
		else
			throw new Meteor.Error(500, 'Liability limit not set.');

		return result;
/*
			var availableDebt = gLiabilityLimit - gDebt[memberId];
			var remaining = availableDebt - amount;

			if (remaining < 0)
			{
				remaining = Math.abs(remaining);
				amount -= remaining;
			}

			gCredit[memberId] += amount;
			gDebt[memberId] += amount;

 */
	}
});

Meteor.startup(function () {
	// On startup, create the shared time account if it hasn't been created yet.
	// The shared account can be identified by how it is the only time account that
	// does not have an owner.
	// 
	// It also differs from other time accounts by how it records the universal 
	// liability limit.

	var sharedAcct = TimeAccounts.findOne({owner:null});
	if (typeof sharedAcct === 'undefined') {
		TimeAccounts.insert({owner:null, credit:0, debt:0, dividends:0, liabilityLimit:20});
	}
});









