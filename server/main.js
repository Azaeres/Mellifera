Accounts.config({
	sendVerificationEmail:true,
	forbidClientAccountCreation:false
});

Meteor.publish('TimeAccounts', function () {
		return TimeAccounts.find({});
});

Helpers = {
	/**
	 * Returns the universal liability limit.
	 * Returns null if it hasn't been set.
	 */
	liabilityLimit: function() {
		var sharedAcct = TimeAccounts.findOne({ owner:null });
		var liabilityLimit = null;
		if (typeof sharedAcct !== 'undefined') {
			liabilityLimit = sharedAcct.liabilityLimit;
		}

		return liabilityLimit;
	},
	/**
	 * Returns the time account for the logged-in user.
	 * 
	 * Returns null if the user isn't logged in.
	 * If the logged-in user doesn't have a time account yet, one is created.
	 */
	userTimeAccount: function() {
	  var acct;
	  var userId = Meteor.userId();

	  if (typeof userId !== 'undefined' && userId !== null) {
	  	acct = TimeAccounts.findOne({ owner:userId });
		  if (typeof acct === 'undefined') {
		    acctId = TimeAccounts.insert({ owner:userId, credit:0, debt:0, dividends:0 });
		    acct = TimeAccounts.findOne({ _id:acctId });
		  }
	  }

	  return acct;
	},
	/**
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
  /** FOR TESTING
   * Zeroes the logged-in user's time account.
   */
  wipeAccount: function() {
    var userId = Meteor.userId();
    if (typeof userId !== 'undefined') {
      TimeAccounts.update({ owner:userId }, { $set:{ credit:0, debt:0, dividends:0 }});
    }

    return 'Account wiped.'
  },
  /**
   * Applies a credit to a user's time account.
   * The credit is applied to their debt, and the excess credit is returned.
   */
  applyCreditToDebt: function(accountId, amount) {
  	var excessCredit = 0, update = 0;
  	var timeAccount = TimeAccounts.findOne({ _id:accountId });
  	var newDebt = timeAccount.debt - amount;

  	if (newDebt < 0) {
  		update = 0;
  		excessCredit = Math.abs(newDebt);
  	}
  	else {
  		update = newDebt;
  	}

  	TimeAccounts.update({ _id:accountId }, { $set:{ debt:update } });
  	return excessCredit;
  },
  /**
   * Returns the shared time account.
   */
  sharedAccount: function() {
	 return TimeAccounts.findOne({ owner:null });
  },
  /**
   * Evenly distributes credit in the shared time account to each user's time account.
   * The remainder (after dividing the credit evenly amongst all users) stays in the shared account.
   */
  distributeDividends: function() {
  	var sharedAccount = h_.sharedAccount();
		var memberCount = Meteor.users.find().count();

		// TODO: Collide the shared time account (apply its credit to its debt).

		// Finds an amount that can be distributed to every user.
		var remainder = sharedAccount.credit % memberCount;
		var divisibleFund = sharedAccount.credit - remainder;
		var dividendAmount = divisibleFund / memberCount;

		var excessCredit = 0;
		TimeAccounts.find({ owner:{ $ne:null } }).map(function(account) {
			// Grants dividend to each member.
			var accountId = account._id;
			excessCredit = h_.applyCreditToDebt(accountId, dividendAmount);
			TimeAccounts.update({ _id:accountId }, { $inc:{ credit:excessCredit } });
		});

		// The remainder of shared credit stays in the shared account for later 
		// 	distribution (after more shared credit accumulates).
		TimeAccounts.update({ _id:sharedAccount._id }, { $set:{ credit:remainder } });
  },
  /** FOR TESTING
   * Generously adds 10 hours to the shared time account.
   */
  boostSharedCredit: function() {
  	TimeAccounts.update({ owner:null }, { $inc:{ credit:1000, debt:1000 } });
  },
  /**
   * Takes credit from the payer's account, and applies it to the payee's debt.
   * If there isn't enough credit in the payer's account, the payment is aborted.
   */
  payment: function(payeeAccountId, amount) {
  	var success = false;

  	var payerAccount = h_.userTimeAccount();
  	var payeeAccount = TimeAccounts.findOne({ _id:payeeAccountId });

		// Makes sure there's enough credit for the payment.
  	if (payerAccount.credit >= amount) {
			// Deduct the amount of the payment from the payer's credit.
			TimeAccounts.update({ _id:payerAccount._id }, { $inc:{ credit:-amount } });

			// Now we deduct the amount of the payment from the payee's debt.
			var excessCredit = h_.applyCreditToDebt(payeeAccountId, amount);

			// Any excess credit is shared, and goes into the shared time account.
			TimeAccounts.update({ owner:null }, { $inc:{ credit:excessCredit } });

			// Distribute shared credit.
			h_.distributeDividends();

			success = true;
  	}

  	return success;
  },
  queryUsersRegex: function(str) {
    var arr, newStr, s;
    s = str || '';
    s = s.replace(RegExp(' ', 'g'), '');
    arr = s.split('');
    newStr = '';

    _.map(arr, function(ch) {
      ch = ch + '.*';
      return newStr += ch;
    });

    return RegExp(newStr, 'i');
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

					if (amount < 0)
						amount = 0;

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
	},
	ApplyCreditToDebt: function() {
		return h_.applyCreditToDebt(h_.userTimeAccountId(), 200);
	},
	DistributeDividends: function() {
		return h_.distributeDividends();
	},
	BoostSharedCredit: function() {
		return h_.boostSharedCredit();
	},
	Payment: function(payeeEmail, amount) {
		var result = { success:false, details:'' };
		var timeAccount;
		var payeeAccount = Meteor.users.findOne({ "emails.address":payeeEmail });
		if (typeof payeeAccount !== 'undefined') {
			timeAccount = TimeAccounts.findOne({ owner:payeeAccount._id });
			if (typeof timeAccount !== 'undefined') {
				result.success = h_.payment(timeAccount._id, amount);
				if (result.success === false) {
					result.details = 'Not enough funds.';
				}
			}
			else {
				result.details = 'Time account not found.';
			}
		}
		else {
			result.details = 'User account not found.';
		}

		return result;
	},
	QueryUsers: function(query) {
		var info = {};

		if (typeof query !== 'undefined') {
			var regex = h_.queryUsersRegex(query);
			var results = Meteor.users.find({ "emails.address":regex }, { $limit:10 });
			var users = results.fetch();

			info = _.map(users, function(user) {
				return { emails:user.emails };
			})
		}

		return info;
	}
});

Meteor.startup(function () {
	// On startup, create the shared time account if it hasn't been created yet.
	// The shared account can be identified by how it is the only time account that
	// does not have an owner.
	// 
	// It also differs from other time accounts by how it records the universal 
	// liability limit.

	var sharedAcct = TimeAccounts.findOne({ owner:null });
	if (typeof sharedAcct === 'undefined') {
		TimeAccounts.insert({ owner:null, credit:0, debt:0, dividends:0, liabilityLimit:16000 });
	}
});









