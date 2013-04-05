

Accounts.config({
	sendVerificationEmail: true,
	forbidClientAccountCreation: false
});


















/**
 * Core Functionality
 */

_.extend(Helpers, {



  /**
   * Applies a credit to a user's time account.
   * The credit is applied to their debt, and the excess credit is returned.
   */
  applyCreditToDebt: function(accountId, amount) {
  	var excessCredit = 0;
  	var account = TimeAccounts.findOne({ _id:accountId });

  	// Make sure the account is valid.
  	if (typeof account != 'undefined') {

	  	// Make sure the amount is valid.
  		if (h_.isInteger(amount) && amount >= 0) {
  			var update = 0;

  			// Find out how much debt would be left over after applying the amount to it.
        var newDebt = h_.getContributionAmount(accountId) - amount;

		  	//  If the leftover debt would be less than zero,
		  	//	set their debt to zero, and return the excess amount.
		  	if (newDebt < 0) {
		  		update = 0;
		  		excessCredit = Math.abs(newDebt);
		  	}
		  	else {
		  		//	If the leftover debt would be greater than or equal to zero,
		  		//	set their debt to that amount.
		  		update = newDebt;
		  	}

		  	var set = {};
		  	set['contributions.'+accountId] = { amount:update, status:'active' };
		  	TimeAccounts.update({ _id:accountId }, { $set:set });
  		}
	  	else
				throw new Meteor.Error(500, 'Invalid amount.');
  	}
  	else
			throw new Meteor.Error(500, 'Time account not found.');

  	return excessCredit;
  },










  contribute: function(accountId, amount) {
		var result = 0;
		var liabilityLimit = h_.liabilityLimit();
		
		if (typeof liabilityLimit != 'undefined') {
			var account = TimeAccounts.findOne(accountId);
			if (typeof account != 'undefined') {
				if (account.status === 'active') {
					if (h_.isInteger(amount) && amount >= 0) {
						var availableDebt = liabilityLimit - h_.getContributionAmount(accountId);
						var remaining = availableDebt - amount;

						if (remaining < 0) {
							remaining = Math.abs(remaining);
							amount -= remaining;
						}

						if (amount < 0)
							amount = 0;

						var inc = { credit:amount };
						inc['contributions.'+accountId+'.amount'] = amount;
						TimeAccounts.update({ _id:account._id }, { $inc:inc });
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

		// Finds an amount that can be evenly distributed to every user.
		// Exclude the shared time account and include only active accounts during distribution.
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
   * Apportions the revenue on a given account to its contributors.
  */
  distributeRevenue: function(accountId) {

  	// Refresh the account snapshot.
  	var account = TimeAccounts.findOne({ _id:accountId });

  	// Make sure the account is valid and active.
  	if (typeof account != 'undefined') {
	  	if (account.status === 'active') {

		  	var revenue = account.revenue;
		  	var excessRevenue = revenue;

		  	// Divide amount evenly, keeping track of remainder.

		  	// Get the count of active contributors.
		  	var contributions = _.pairs(account.contributions);
		  	var activeContributions = _.filter(contributions, function(contributor) {
		  		var value = contributor[1];
					return (value.status === 'active');
		  	});

		  	// d_('activeContributions');
		  	// d_(activeContributions);

		  	var count = _.size(activeContributions);
		  	var remainder = revenue % count;
		  	var divisibleAmount = revenue - remainder;

		  	// This is where we might stop recursing.
		  	// We may not have enough revenue to distribute evenly amongst the contributors.
		  	if (divisibleAmount > 0) {
          // Find the amount to distribute during this pass.
          var shareAmount = divisibleAmount / count;

			  	// d_('shareAmount');
			  	// d_(shareAmount);

          // We start gathering excess revenue with whatever we're not distributing.
          excessRevenue = remainder;

          // Apply the share amount to each contributor's debt.
          var debtLeft = 0;
          _.map(activeContributions, function(contributor) {
          	// d_('map args');
          	// d_(arguments);

          	var contributorAccountId = contributor[0];
          	var value = contributor[1];

          	var update = 0;

            // Find out how much debt would be left over after applying the share amount to it.
            var newDebt = value.amount - shareAmount;

            // If the leftover debt is negative, we have overflow and need to gather it up for the next pass.
            if (newDebt < 0) {
              // Debt cannot be less than zero.
              update = 0;

              // Gather excess revenue.
              excessRevenue += Math.abs(newDebt);
            }
            else {
              // No overflow, so just set the new debt amount.
              update = newDebt;
            }

            // Records this contributor's new debt amount.
            // d_("new debt for "+contributorAccountId);
            // d_(update);

            h_.setContributionAmount(accountId, contributorAccountId, update);

            debtLeft += update;
          });

          // d_('excessRevenue');
          // d_(excessRevenue);

          // Record the excess revenue for the next pass.
          TimeAccounts.update({ _id:accountId }, { $set:{ revenue:excessRevenue } });

					// d_('debtLeft');
					// d_(debtLeft);

          // Recursively attempts another pass.
          if (debtLeft > 0) {
          	// d_("Trying another pass...");
          	this.distributeRevenue(accountId);
          }
		  	}
	  	}
	  	else
				throw new Meteor.Error(500, 'Failed to distribute revenue. Account is frozen.');
		}
		else
			throw new Meteor.Error(500, 'Failed to distribute revenue. Account not found.');
  },






  
  /**
   * Takes credit from the payer's account, and applies it to the payee's debt.
   * If there isn't enough credit in the payer's account, the payment is aborted.
   */
  payment: function(payerAccountId, payeeAccountId, amount) {
  	var result = false;

  	// Make sure the amount is valid.
  	if (h_.isInteger(amount) && amount >= 0) {
	  	var payerAccount = TimeAccounts.findOne({ _id:payerAccountId });

	  	// Make sure the payer has a valid and active account.
	  	if (typeof payerAccount != 'undefined') {
		  	if (payerAccount.status === 'active') {
			  	var payeeAccount = TimeAccounts.findOne({ _id:payeeAccountId });

			  	// Make sure the payee has a valid and active account.
			  	if (typeof payeeAccount != 'undefined') {
				  	if (payeeAccount.status === 'active') {

							// Make sure there's enough credit for the payment.
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
						throw new Meteor.Error(500, 'Payee\'s account not found.');
		  	}
		  	else
					throw new Meteor.Error(500, 'Payer\'s account is frozen.');
			}
			else
				throw new Meteor.Error(500, 'Payer\'s account not found.');
  	}
  	else
			throw new Meteor.Error(500, 'Invalid amount.');

  	return result;
  }
});





















Meteor.startup(function () {
	// On startup, create the shared time account if it hasn't been created yet.
	// The shared account can be identified by how it is the only time account that
	// does not have an owner.
	// 
	// It also differs from other time accounts by how it records the universal 
	// liability limit.

	h_.createSharedTimeAccount();
});


Meteor.publish('TimeAccounts', function () {
	return TimeAccounts.find();
});








