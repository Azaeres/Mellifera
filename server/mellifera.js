Accounts.config({
	sendVerificationEmail:true,
	forbidClientAccountCreation:false
});

Meteor.startup(function () {
	// On startup, create the shared time account if it hasn't been created yet.
	// The shared account can be identified by how it is the only time account that
	// does not have an owner.
	// 
	// It also differs from other time accounts by how it records the universal 
	// liability limit.

	var sharedAcct = TimeAccounts.findOne({ liabilityLimit:{ $exists:true } });
	if (sharedAcct === null) {
		TimeAccounts.insert({ owner:null, credit:0, debt:0, status:'active', liabilityLimit:16000 });
	}
});


Meteor.publish('TimeAccounts', function () {
	return TimeAccounts.find();
});










_.extend(Helpers, {
 	/**
	 * Returns the time account for the logged-in user.
	 * 
	 * Returns null if the user isn't logged in.
	 * If the logged-in user doesn't have a time account yet, one is created.
	 */
	userTimeAccount: function() {
	  var account;
	  var userId = Meteor.userId();

	  if (userId !== null) {
	  	account = TimeAccounts.findOne({ owner:userId });
		  if (account === null) {
		    accountId = TimeAccounts.insert({ owner:userId, credit:0, debt:0, status:'frozen' });
		    account = TimeAccounts.findOne({ _id:accountId });
		  }
	  }

	  return account;
	},
	/**
	 * Returns the time account id for the logged-in user.
	 * 
	 * Returns null if the user isn't logged in.
	 * If the logged-in user doesn't have a time account yet, one is created.
	 */
	userTimeAccountId: function() {
		var accountId;
		var account = h_.userTimeAccount();

		if (account !== null) {
			accountId = account._id;
		}

		return accountId;
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
	 return TimeAccounts.findOne({ liabilityLimit:{ $exists:true } });
  },
  contribute: function(accountId, amount) {
		var result = 0;
		var liabilityLimit = h_.liabilityLimit();
		
		if (liabilityLimit !== null) {
			var account = TimeAccounts.findOne(accountId);
			if (account !== null) {
				if (account.status === 'active') {
					if (h_.isInteger(amount) && amount >= 0) {
						var availableDebt = liabilityLimit - account.debt;
						var remaining = availableDebt - amount;

						if (remaining < 0) {
							remaining = Math.abs(remaining);
							amount -= remaining;
						}

						if (amount < 0)
							amount = 0;

						TimeAccounts.update({ _id:account._id }, { $inc:{ credit:amount, debt:amount } });
						result = amount;
					}
					else
						throw new Meteor.Error(500, 'Invalid contribution amount.');
				}
				else
					throw new Meteor.Error(500, 'User\'s time account is frozen.');
			}
			else
				throw new Meteor.Error(500, 'No time account found for user.');
		}
		else
			throw new Meteor.Error(500, 'Liability limit not set.');

		return result;
	},
  /**
   * Evenly distributes credit in the shared time account to each user's time account.
   * The remainder (after dividing the credit evenly amongst all users) stays in the shared account.
   */
  distributeDividends: function() {
  	var sharedAccount = h_.sharedAccount();
    h_.collideTimeAccount(sharedAccount._id);

		// Finds an amount that can be distributed to every user.
		var count = TimeAccounts.find({ $and: [{ liabilityLimit:{ $exists:false } }, { status:'active' }] }).count();
		if (count > 0) {
			// Refresh our snapshot of the shared account, now that it's been collided.
  		sharedAccount = h_.sharedAccount();

			var remainder = sharedAccount.credit % count;
			var divisibleFund = sharedAccount.credit - remainder;
			var dividendAmount = divisibleFund / count;

			var amountNotDistributed = divisibleFund;
			TimeAccounts.find({ $and: [{ liabilityLimit:{ $exists:false } }, { status:'active' }] }).map(function(account) {
				// Grants dividend to each member.
				var accountId = account._id;
				var excessCredit = h_.applyCreditToDebt(accountId, dividendAmount);
				TimeAccounts.update({ _id:accountId }, { $inc:{ credit:excessCredit } });
				amountNotDistributed -= dividendAmount;
			});

			// The remainder of shared credit stays in the shared account for later 
			// 	distribution (after more shared credit accumulates).
			amountNotDistributed += remainder;
			TimeAccounts.update({ _id:sharedAccount._id }, { $set:{ credit:amountNotDistributed } });
		}
  },
  /**
   * Takes credit from the payer's account, and applies it to the payee's debt.
   * If there isn't enough credit in the payer's account, the payment is aborted.
   */
  payment: function(payeeAccountId, amount) {
  	var result = false;

  	if (h_.isInteger(amount) && amount >= 0) {
	  	var payerAccount = h_.userTimeAccount();
	  	var payeeAccount = TimeAccounts.findOne({ _id:payeeAccountId });

	  	if (payeeAccount.status === 'active') {
				// Makes sure there's enough credit for the payment.
		  	if (payerAccount.credit >= amount) {
					// Deduct the amount of the payment from the payer's credit.
					TimeAccounts.update({ _id:payerAccount._id }, { $inc:{ credit:-amount } });

					// Now we deduct the amount of the payment from the payee's debt.
					var excessCredit = h_.applyCreditToDebt(payeeAccountId, amount);

					// Any excess credit is shared, and goes into the shared time account.
					TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:{ credit:excessCredit } });

					// Distribute shared credit.
					h_.distributeDividends();

					result = true;
		  	}
		  	else
					throw new Meteor.Error(500, 'Not enough funds.');
	  	}
	  	else
				throw new Meteor.Error(500, 'Payee\'s account is frozen.');
  	}
  	else
			throw new Meteor.Error(500, 'Invalid amount.');

  	return result;
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
  },
  collideTimeAccount: function(accountId) {
  	var timeAccount = TimeAccounts.findOne({ _id:accountId });
  	var excessCredit = h_.applyCreditToDebt(accountId, timeAccount.credit);
  	TimeAccounts.update({ _id:accountId }, { $set:{ credit:excessCredit } });
  },
  seizeDebt: function(accountId, amount) {
  	var account = TimeAccounts.findOne({ _id:accountId });
  	
  	var newDebt = account.debt - amount;
  	var seizedDebt = amount;
  	if (newDebt < 0) {
  		newDebt = 0;
  		seizedDebt = account.debt;
  	}
  	
  	TimeAccounts.update({ _id:accountId }, { $set:{ debt:newDebt } });
  	TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:{ debt:seizedDebt } });
  },
  setLiabilityLimit: function(newLimit) {
  	var seizedDebt = 0;

  	TimeAccounts.find({ liabilityLimit:{ $exists:false } }).map(function(account) {
  		if (newLimit < account.debt) {
  			var diff = account.debt - newLimit;
  			seizedDebt += diff;
  			TimeAccounts.update({ _id:account._id }, { $set:{ debt:newLimit } });
  		}
  	});

  	TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $set:{ liabilityLimit:newLimit }, $inc:{ debt:seizedDebt } });
  },
  freezeTimeAccount: function(accountId) {
  	var account = TimeAccounts.findOne(accountId);

		// The shared account cannot be frozen.
  	if (typeof account.liabilityLimit != 'undefined') {
			TimeAccounts.update({ _id:account._id }, { $set:{ status:'frozen' } });
  	}
  },
  activateTimeAccount: function(accountId) {
  	var account = TimeAccounts.findOne(accountId);
		TimeAccounts.update({ _id:account._id }, { $set:{ status:'active' } });
  }
});









Meteor.methods({
	UserTimeAccountId: function() {
	  return h_.userTimeAccountId();
	},
	LiabilityLimit: function() {
		return h_.liabilityLimit();
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
		var accountId = h_.userTimeAccountId();
		if (accountId !== null) {
			result = h_.contribute(accountId, amount);
		}
		else
			throw new Meteor.Error(500, 'User not logged in.');

		return result;
	},
	ApplyCreditToDebt: function() {
		return h_.applyCreditToDebt(h_.userTimeAccountId(), 200);
	},
	DistributeDividends: function() {
		return h_.distributeDividends();
	},
	Payment: function(payeeEmail, amount) {
		var result = false;
		var timeAccount;
		var payeeAccount = Meteor.users.findOne({ 'emails.address':payeeEmail });
		if (payeeAccount !== null) {
			timeAccount = TimeAccounts.findOne({ owner:payeeAccount._id });
			if (timeAccount !== null) {
				result = h_.payment(timeAccount._id, amount);
			}
			else
				throw new Meteor.Error(500, 'Found no time account for that user.');
		}
		else
			throw new Meteor.Error(500, 'Found no user account with that email address.');

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
	},
	UniversalBalance: function() {
		var credit = 0, debt = 0, result = { credit:null, debt:null, liabilityLimit:null };
		TimeAccounts.find().map(function(account) {
			credit += account.credit;
			debt += account.debt;
		});
		result.credit = credit;
		result.debt = debt;

		var memberCount = Meteor.users.find().count();
		result.liabilityLimit = h_.liabilityLimit() * memberCount;

		return result;
	}
});









