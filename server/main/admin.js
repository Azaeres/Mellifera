
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
  	
  	var contributionAmount = h_.getOutstandingContributionAmount(accountId);
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
	  	var contributionAmount = h_.getOutstandingContributionAmount(accountId);
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

    if (_.isNull(email)) {
      account = this.userTimeAccount();
    }
    else {
      account = this.findTimeAccountByEmail(email);
    }

    if (!_.isUndefined(account)) {
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





  /*
  Deducts a given amount from a given contributor's outstanding debt.
  Returns the amount remaining after the deduction.
  */
  deductAmountFromContributor: function(accountId, contributorAccountId, amount) {
    var excessAmount = 0;
    var account = TimeAccounts.findOne({ _id:accountId });
    
    // Make sure the account is valid and active.
    if (!_.isUndefined(account)) {
      if (account.status === 'active') {

        // Makes sure the given amount is valid.
        if (h_.isInteger(amount) && amount > 0) {

          // Applies the deduction to each accepted contribution until it's gone
          // (or until we have no more accepted contributions to apply it to),
          // starting with the oldest accepted contribution first.

          // The `excessAmount` keeps track of the amount that has yet to be applied.
          excessAmount = amount;
          var contributions = this.getContributions(accountId, contributorAccountId);

          _.every(contributions, function(contribution, i) {

            // As contributions are made, they are just pushed onto the end of 
            // the contribution array, so the array'll automatically be ordered by 
            // oldest contribution first.
            if (_.isDate(contribution.dateAccepted)) {

              // If the `dateAccepted` is a date, it has been accepted, so this 
              // contribution is considered active.
              // Apply as much of the deduction as we can.

              var amountLeft = contribution.outstandingAmount - amount;
              if (amountLeft < 0) {

                // If the amount left is negative, we'll zero out the contribution,
                // and we'll keep iterating if we still have funds.
                
                // A zeroed-out contribution is not a contribution, so
                // we'll just remove it.
                contributions.splice(i, 1);

                // Take away the amount that was actually deducted from the 
                // excess amount.
                var remainder = Math.abs(amountLeft);
                var amountDeducted = amount - remainder;
                excessAmount -= amountDeducted;

                if (excessAmount === 0) {
                  // If we have no excess at this point, we're out of funds,
                  // so we'll stop here.
                  // Returning `false` causes the every loop to break.
                  return false;
                }
              }
              else {
                // If the amount left is positive, that means we ran out of funds
                // applying them to this contribution.
                contribution.outstandingAmount = amountLeft;
                excessAmount = 0;

                return false;
              }
            }
            else {

              // If the `dateAccepted` isn't a date, it hasn't been accepted yet,
              // so we ignore this contribution.
              // We'll still need to keep it around, though.
            }

            return true;
          });

          // When we're done applying the deduction to the contributions,
          // the modified contributions array should be recorded to the time account.
          var set = { contributors:{} };
          set.contributors[contributorAccountId] = newContributions;
          TimeAccounts.update({ _id:accountId }, { $set:set });



        //   var set = { contributors:{} };
        //   set.contributors[contributorAccountId] = { amount:amount, status:'active' };
        //   TimeAccounts.update({ _id:accountId }, { $set:set });


          // A contribution with no outstanding debt isn't a contribution at all.
          // We'll just remove it.
          var unset = { contributors:{} };
          unset.contributors[contributorAccountId] = '';
          TimeAccounts.update({ _id:accountId }, { $unset:unset });
        }
      }
      else
        throw new Meteor.Error(500, 'Failed to get contribution amount. Account is frozen.');
    }
    else
      throw new Meteor.Error(500, 'Failed to get contribution amount. Account not found.');

    return excessAmount;
  }
});




















