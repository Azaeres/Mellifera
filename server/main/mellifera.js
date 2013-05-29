

Accounts.config({
	sendVerificationEmail: true,
	forbidClientAccountCreation: false
});


















/**
 * Core Functionality
 */

_.extend(Helpers, {


	/*
	* Contributes a given amount from a given account to a given account.
	* If the `toAccountId` is not provided, the contribution is made both from and to the `fromAccountId`.
	*/
  contribute: function(fromAccountId, amount, toAccountId) {
		var result = 0;
		var liabilityLimit = h_.liabilityLimit();
		
		// Makes sure we've set a liability limit.
		if (!_.isUndefined(liabilityLimit)) {

			// Gets a snapshot of the given to-account.
			// If `toAccountId` is not provided, use `fromAccountId` in its place.
			if (_.isUndefined(toAccountId)) {
				toAccountId = fromAccountId;
			}


			var account = TimeAccounts.findOne(toAccountId);

			// Makes sure the account is valid and active.
			if (!_.isUndefined(account)) {
				if (account.status === 'active') {

					// Makes sure the given amount is valid.
					if (h_.isInteger(amount) && amount >= 0) {

						// Sees if there's enough room within the liability limit to take on
						// more debt.
						var availableDebt = liabilityLimit - h_.getOutstandingContributionAmount(toAccountId);
						var remaining = availableDebt - amount;

						if (remaining < 0) {
							// Not enough room to take on the full amount, so we cap it.
							remaining = Math.abs(remaining);
							amount -= remaining;
						}

						// The loan amount we issue cannot be negative.
						if (amount < 0)
							amount = 0;

						// Records the contribution association.
						h_.recordContribution(fromAccountId, amount, toAccountId);

						// Returns the loan amount that was ultimately issued.
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
   * Apportions the revenue on a given account to its active contributors.
  */
  distributeRevenue: function(accountId) {

  	// Refresh the account snapshot.
  	var account = TimeAccounts.findOne({ _id:accountId });

  	// Make sure the account is valid and active.
  	if (!_.isUndefined(account)) {
	  	if (account.status === 'active') {

		  	var revenue = account.revenue;

		  	// Divide amount evenly amongst all contributors, keeping track of the remainder.

		  	// Get the count of active contributors.
		  	var contributors = _.pairs(account.contributors);
		  	var activeContributions = {};

		  	_.map(contributors, function(contributor) {

			  	var contributorAccountId = contributor[0];
			  	var contributionIds = contributor[1];
			  	// d_(contributionIds);

			  	_.map(contributionIds, function(contributionId) {

			  		if (!_.has(activeContributions, contributionId)) {
			  			var contribution = Contributions.findOne({ _id:contributionId })
					  	if (!_.isNull(contribution.dateActivated)) {
					  		activeContributions[contributionId] = contribution;
					  	}
			  		}

			  	});
		  	});

		  	var activeContributionIds = _.keys(activeContributions);

		  	// d_(activeContributions);


		  	var count = _.size(activeContributionIds);
		  	var remainder = revenue % count;
		  	var divisibleAmount = revenue - remainder;


		  	// This function will stop recursing when the divisible amount reaches zero.
		  	// This means we would not have enough revenue to apportion evenly amongst the contributors.
		  	if (divisibleAmount > 0) {

          // Find the amount to distribute during this pass.
          var shareAmount = divisibleAmount / count;

          // d_('shareAmount');
          // d_(shareAmount);

          // We start gathering excess revenue with whatever we're not distributing.
          var excessRevenue = remainder;

          // Apply the share amount to each contributor's debt.
          var debtLeft = 0;
          _.map(activeContributions, function(contribution) {

            // Find out how much debt would be left over after applying the share amount to it.
            var newDebt = contribution.amountOutstanding - shareAmount;

            // Debt cannot be less than zero.
            // If the leftover debt is negative, we have overflow and need to gather it up for the next pass.

          	var update = 0;
            if (newDebt < 0) {
              // Gather excess revenue.
              excessRevenue += Math.abs(newDebt);
            }
            else {
              // No overflow, so just set the new debt amount.
              update = newDebt;
            }

	          // d_('update');
	          // d_(update);

	          if (update === 0) {
	          	// If the contribution has been zeroed, it can be removed.
	          	h_.removeContribution(contribution._id);
	          }
	          else {
	          	// Record the contribution's new outstanding amount.
	          	// d_('recording new amount');
	          	// d_(contribution);

	          	Contributions.update({ _id:contribution._id }, { $set:{ amountOutstanding:update } });
	          }

            // Keep track of the total debt left amongst all the contributors.
            debtLeft += update;
          });

          // Record the excess revenue for the next pass.
          TimeAccounts.update({ _id:accountId }, { $set:{ revenue:excessRevenue } });

          // If we still have outstanding debt left, recursively attempt another pass.
          if (debtLeft > 0) {
          	this.distributeRevenue(accountId);
          }
          else {
			  		d_('Stopping recursion - no more debt left');
			  		d_('Sending excess revenue to shared account');
			  		d_(excessRevenue);

						TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:{ credit:excessRevenue } });

			  		// var sharedAccount = h_.sharedAccount();
			  		// d_(sharedAccount);

			  		h_.distributeDividends();
          }
		  	}
		  	else {
		  		d_('Stopping recursion - cannot distribute leftover revenue');
		  		d_('Will not send excess revenue to shared account');
		  	}
	  	}
	  	else
				throw new Meteor.Error(500, 'Failed to distribute revenue. Account is frozen.');
		}
		else
			throw new Meteor.Error(500, 'Failed to distribute revenue. Account not found.');
  },






  /**
   * Evenly distributes credit in the shared time account to each user's time account.
   * The remainder (after dividing the credit evenly amongst all users) stays in the shared account.
   */
  distributeDividends: function() {
  	var sharedAccount = h_.sharedAccount();

    h_.collideSharedTimeAccount();

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

			TimeAccounts.find({ $and: [{ liabilityLimit:{ $exists:false } }, { status:'active' }] })
				.map(function(account) {
					// Grants dividend to each member.
					var accountId = account._id;
					d_(accountId);
					/*
					var excessCredit = h_.applyCreditToDebt(accountId, dividendAmount);
					TimeAccounts.update({ _id:accountId }, { $inc:{ credit:excessCredit } });
					amountNotDistributed -= dividendAmount;
					*/
				});

			// The remainder of shared credit stays in the shared account for later 
			// 	distribution (after more shared credit accumulates).
			amountNotDistributed += remainder;
			TimeAccounts.update({ _id:sharedAccount._id }, { $set:{ credit:amountNotDistributed } });

		}
  },









  /**
   * Applies a credit to a user's time account.
   * The credit is applied to their debt, and the excess credit is returned.
   */
  applyCreditToDebt: function(accountId, amount) {

   /*
  	var excessCredit = 0;
  	var account = TimeAccounts.findOne({ _id:accountId });

  	// Make sure the account is valid.
  	if (!_.isUndefined(account)) {

	  	// Make sure the amount is valid.
  		if (h_.isInteger(amount) && amount >= 0) {
  			var update = 0;

  			// Find out how much debt would be left over after applying the amount to it.
        var newDebt = h_.getOutstandingContributionAmount(accountId) - amount;

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
	*/
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
	// keeps track of a liability limit.
	// 
	// It also differs from other time accounts by how it records the universal 
	// liability limit.

	h_.createSharedTimeAccount();

	if (h_.inTestingEnvironment()) {
		h_.runTests();
	}
});






