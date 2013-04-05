
/**
 * Upkeep & Maintenance
 */

_.extend(Helpers, {
  collideTimeAccount: function(accountId) {
  	var account = TimeAccounts.findOne({ _id:accountId });
  	var excessCredit = h_.applyCreditToDebt(accountId, account.credit);
  	TimeAccounts.update({ _id:accountId }, { $set:{ credit:excessCredit } });
  },
  seizeDebt: function(accountId, amount) {
  	var account = TimeAccounts.findOne({ _id:accountId });
  	
  	var contributionAmount = h_.getContributionAmount(accountId);
  	var newDebt = contributionAmount - amount;
  	var seizedDebt = amount;
  	if (newDebt < 0) {
  		newDebt = 0;
  		seizedDebt = contributionAmount;
  	}
  	
  	var set = {};
  	set['contributions.'+accountId+'.amount'] = newDebt;
  	TimeAccounts.update({ _id:accountId }, { $set:set });

  	var inc = {};
  	inc['contributions.'+accountId+'.amount'] = seizedDebt;
  	TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:inc });
  },
  setLiabilityLimit: function(newLimit) {
  	var seizedDebt = 0;

  	TimeAccounts.find({ liabilityLimit:{ $exists:false } }).map(function(account) {
	  	var contributionAmount = h_.getContributionAmount(accountId);
  		if (newLimit < contributionAmount) {
  			var diff = contributionAmount - newLimit;
  			seizedDebt += diff;

  			var contributions = {};
  			contributions[account._id] = { amount:newLimit };
		  	var set = { contributions:contributions };
  			TimeAccounts.update({ _id:account._id }, { $set:set });
  		}
  	});

  	var sharedAccount = h_.sharedAccount();

  	var inc = {};
  	inc['contributions.'+sharedAccount._id+'.amount'] = seizedDebt;
  	TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $set:{ liabilityLimit:newLimit }, $inc:inc });
  },
  freezeTimeAccount: function(accountId) {
  	var account = TimeAccounts.findOne(accountId);
  	if (typeof account != 'undefined') {
			// The shared account cannot be frozen.
	  	if (typeof account.liabilityLimit == 'undefined') {
				TimeAccounts.update({ _id:account._id }, { $set:{ status:'frozen' } });
	  	}
		}
  },
  activateTimeAccount: function(email) {
  	var account;

		if (email === null) {
			account = this.userTimeAccount();
		}
		else {
	  	account = this.findTimeAccountByEmail(email);
		}

  	if (typeof account !== 'undefined') {
			TimeAccounts.update({ _id:account._id }, { $set:{ status:'active' } });
  	}
  },
  createSharedTimeAccount: function() {
  	var sharedAccountId;

		var sharedAccount = h_.sharedAccount();
		if (typeof sharedAccount === 'undefined') {
			var limit = Meteor.settings.liabilityLimit;
			sharedAccountId = TimeAccounts.insert({ owner:null, credit:0, contributions:{}, status:'active', liabilityLimit:limit });
		}

		return sharedAccountId;
  },
  setContributionAmount: function(accountId, contributorAccountId, amount) {
    var account = TimeAccounts.findOne({ _id:accountId });
    
    // Make sure the account is valid and active.
    if (typeof account != 'undefined') {
      if (account.status === 'active') {
        var set = { contributions:{} };
        set.contributions[contributorAccountId] = { amount:amount, status:'active' };
        TimeAccounts.update({ _id:accountId }, { $set:set });
      }
      else
        throw new Meteor.Error(500, 'Failed to get contribution amount. Account is frozen.');
    }
    else
      throw new Meteor.Error(500, 'Failed to get contribution amount. Account not found.');
  }
});
