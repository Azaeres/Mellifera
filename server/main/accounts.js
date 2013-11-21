




/**
 * Accounts
 */


Meteor.publish('TimeAccounts', function () {
	return TimeAccounts.find();
});

Meteor.publish('Contributions', function () {
	return Contributions.find();
});







_.extend(Helpers, {




 	/**
	 * Returns the time account for the logged-in user.
	 * 
	 * Returns null if the user isn't logged in.
	 * If the logged-in user doesn't have a time account yet, one is created.
	 */
	userTimeAccount: function() {
	  var account = null;
	  var userId = Meteor.userId();

	  if (!_.isNull(userId)) {
	  	account = h_.timeAccount(userId);
	  }

	  return account;
	},





	/**
	 * Returns the time account id for the logged-in user.
	 * 
	 * Returns null if the user isn't logged in.
	 */
	userTimeAccountId: function() {
		var accountId;
		var account = h_.userTimeAccount();

		if (!_.isUndefined(account)) {
			accountId = account._id;
		}

		return accountId;
	},




	/**
	 * Returns the time account for the given user.
	 * If the given user doesn't have a time account, one is created for them.
	 */
	timeAccount: function(ownerId) {
		var accountId, account;

		// Make sure the `ownerId` specified is valid.
		var owner = Meteor.users.findOne({ _id:ownerId });
		
		if (!_.isUndefined(owner)) {

			// See if that owner has a time account.
	  	account = TimeAccounts.findOne({ owner:ownerId });
		  if (_.isUndefined(account)) {

		  	// If they don't have a time account, create one.
		    accountId = TimeAccounts.insert({
		    	owner: ownerId,
		    	status: 'frozen',
		    	role: 'user',
		    	credit: 0,

		    	// Revenue distribution
		    	revenue: 0,
		    	contributors: {},

		    	// Dividend distribution
		    	dividends: 0,
		    	contributions: {}
		    });

		    account = TimeAccounts.findOne(accountId);

		    // For now, the first user (other than the shared time account),
	    	// 	will be admin.
	    	if (TimeAccounts.find().count() === 2) {
	    		TimeAccounts.update({ _id:accountId }, { $set:{ role:'admin' } });
	    	}
		  }
		}
		else
			throw new Meteor.Error(500, 'User not found');

		return account;
	},





  findUserByEmail: function(email) {
		var regex = h_.queryUsersRegex(email);
		var user = Meteor.users.findOne({ "emails.address":regex });

		return user;
  },





  findTimeAccountByEmail: function(email) {
  	var result;

		var user = this.findUserByEmail(email);
		if (typeof user != 'undefined') {
			var userId = user._id;
			result = TimeAccounts.findOne({ owner:userId });
		}

		return result;
  },




  findEmailByTimeAccountId: function(accountId) {
  	var timeAccount = TimeAccounts.findOne(accountId);
  	d_(timeAccount);

  	return 'foo';
  }

});



