
/**
 * Upkeep & Maintenance
 */

_.extend(Helpers, {




  collideSharedTimeAccount: function() {
    var sharedAccount = h_.sharedAccount();

    // Find out how much debt would be left over after applying the amount to it.
    var newDebt = sharedAccount.debt - sharedAccount.credit;

    //  If the leftover debt would be less than zero,
    //  set their debt to zero, and return the excess amount.
    if (newDebt < 0) {
      var newCredit = Math.abs(newDebt);
      TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $set:{ credit:newCredit, debt:0 } });
    }
    else {
      TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $set:{ credit:0, debt:newDebt } });
    }
  },





  seizeDebt: function(accountId, amount) {
  	var account = TimeAccounts.findOne({ _id:accountId });
  	
  	var contributionAmount = h_.totalOutstandingContributionAmount(accountId);
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
	  	var contributionAmount = h_.totalOutstandingContributionAmount(accountId);
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
  	if (!_.isUndefined(account)) {
      // The shared account cannot be activated or frozen.
      // The shared time account stands out because it is the only account 
      // with a liability limit.
	  	if (_.isUndefined(account.liabilityLimit)) {
				TimeAccounts.update({ _id:account._id }, { $set:{ status:'frozen' } });
	  	}
      else
        throw new Meteor.Error(500, 'Failed to freeze time account. Cannot freeze the shared time account.');
		}
    else
      throw new Meteor.Error(500, 'Failed to freeze time account. Account not found.');
  },





  activateTimeAccount: function(accountId) {
    var account = TimeAccounts.findOne(accountId);
    if (!_.isUndefined(account)) {
      // The shared account cannot be activated or frozen.
      // The shared time account stands out because it is the only account 
      // with a liability limit.
      if (_.isUndefined(account.liabilityLimit)) {
        TimeAccounts.update({ _id:account._id }, { $set:{ status:'active' } });
      }
      else
        throw new Meteor.Error(500, 'Failed to activate time account. Cannot activate the shared time account.');
    }
    else
      throw new Meteor.Error(500, 'Failed to activate time account. Account not found.');
  },





  createSharedTimeAccount: function() {
  	var sharedAccountId;

		var sharedAccount = h_.sharedAccount();
		if (_.isUndefined(sharedAccount)) {
			var limit = Meteor.settings.liabilityLimit;
			sharedAccountId = TimeAccounts.insert({ credit:0, debt:0, liabilityLimit:limit });
		}

		return sharedAccountId;
  },







  totalBalance: function() {

    var r = { credit:0, debt:0 };

    // Sum up shared account.
    var sharedAccount = h_.sharedAccount();
    r.credit += sharedAccount.credit;
    r.debt += sharedAccount.debt;

    // Sum up all time accounts.
    TimeAccounts.find({ liabilityLimit:{ $exists:false } }).map(function(account) {
      r.credit += account.credit + account.dividends + account.revenue;
    });

    // Sum up all contributions.
    Contributions.find().map(function(contribution) {
      r.debt += contribution.amountOutstanding;
    });

    return r;
  }
});




















