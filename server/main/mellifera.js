

Accounts.config({
	sendVerificationEmail: true,
	forbidClientAccountCreation: false
});


var _activeDistribution = function(account, distributionName) {

	var accounts;
	if (distributionName === 'revenue') {
		accounts = _.pairs(account.contributors);
	}
	else if (distributionName === 'dividends') {
		accounts = _.pairs(account.contributions);
	}
	
	var distribution = {};

	_.map(accounts, function(accountInfo) {

  	var accountId = accountInfo[0];
  	var contributionIds = accountInfo[1];

		// Make sure this contributor is active.

		var account = TimeAccounts.findOne({ _id:accountId });
		var contributorIsActive = account.status === 'active';
  	// d_('Account: ' + account._id + ': "' + account.status + '"' + (contributorIsActive ? '  *' : ''));

  	_.map(contributionIds, function(contributionId) {

  		var contribution = Contributions.findOne({ _id:contributionId });
  		var contributionIsActive = !_.isNull(contribution.dateActivated);
  		// d_('  ' + contributionId + ': "' + (contributionIsActive ? 'active' : 'pending' ) + '": ' + contribution.amountOutstanding + '/' + contribution.amountReported + '  ' + (contributionIsActive ? '*' : ''));

  		if (contributorIsActive && contributionIsActive) {
				// d_('+ {' + accountId + ':[' + contributionId + '] }')
  			if (_.has(distribution, accountId)) {
  				// d_('Distribution already has account ' + accountId);
  				distribution[accountId].push(contribution);
  			}
  			else {
  				// d_('Distribution does not have account ' + accountId);
  				distribution[accountId] = [contribution];
  			}
  		}
  	});
	});

	return distribution;
};















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
   * Apportions the revenue/dividends (remainderPool) on a given account 
   * to its active contributors/contributions.
  */
  distribute: function(accountId, distributionName) {

  	// Refresh the account snapshot.
  	var account = TimeAccounts.findOne({ _id:accountId });

  	// d_('\nAccount');
  	// d_(account);

  	// Make sure the account is valid and active.
  	if (!_.isUndefined(account)) {
	  	if (account.status === 'active') {

		  	var remainderPool = account[distributionName];

		  	// Divide amount evenly amongst all contributors/contributions, keeping track of the remainder.

				d_('\nGathering active distribution "' + distributionName + '"...');
		  	var distribution = _activeDistribution(account, distributionName);

		  	// d_('\nActive distribution');
		  	// d_(distribution);


		  	var count = _.size(distribution);

		  	var remainder = remainderPool % count;
		  	var divisibleAmount = remainderPool - remainder;


		  	// This function will stop recursing when the divisible amount reaches zero.
		  	// This means we would not have enough revenue to apportion evenly amongst the contributors.
		  	if (divisibleAmount > 0) {

          // Find the amount to distribute during this pass.
          var shareAmount = divisibleAmount / count;
          d_('\nAmount in remainder pool: ' + remainderPool)
			  	d_('Number of shares: ' + count);
			  	d_('Amount in each share: ' + shareAmount + '\n');

          // We start gathering excess revenue with whatever we're not distributing.
          var outstandingRemaining = false;
          var excess = remainder;
          var totalShareApplied = 0;

          // Apply the share amount to each contributor's debt.
          _.map(distribution, function(contributionSeries, accountId) {

          	d_('Share for ' + accountId + ': ' + shareAmount);
          	var shareRemaining = shareAmount;

          	_.each(contributionSeries, function(contribution) {

          		var newOutstandingAmount = contribution.amountOutstanding - shareRemaining;
          		var shareApplied = 0;
          		if (newOutstandingAmount <= 0) {
          			shareApplied = contribution.amountOutstanding;
          			newOutstandingAmount = 0;
          			shareRemaining -= shareApplied;

          			// The contribution's outstanding amount has been zeroed, so it can be removed.
          			// d_('Removing contribution ' + contribution._id);
          			h_.removeContribution(contribution._id);
          		}
          		else {
          			shareApplied = contribution.amountOutstanding - newOutstandingAmount;
          			shareRemaining = 0;

          			Contributions.update({ _id:contribution._id }, { $set:{ amountOutstanding:newOutstandingAmount } });
          		}

          		if (newOutstandingAmount > 0) {
          			outstandingRemaining = true;
          		}

          		totalShareApplied += shareApplied;

	          	d_('  ' + contribution._id + ': Reported: ' + contribution.amountReported + ': Outstanding: ' + contribution.amountOutstanding + ' -> ' + newOutstandingAmount 
	          		+ ', Share applied: ' + shareApplied + ': Share remaining: ' + shareRemaining);
          	});

          	// If we have an excess share at this point, then none of the contributions in this series has debt left.
          	d_('  > Excess share: ' + shareRemaining);
          	excess += shareRemaining;
          });

					d_('\nTotal applied: ' + totalShareApplied + ', Total excess: ' + excess + ', Outstanding remaining: ' + outstandingRemaining);

          // If we still have outstanding debt left, recursively attempt another pass.
          if (outstandingRemaining) {
	          // Record the excess for the next pass.
	          var set = {};
	          set[distributionName] = excess;
	          TimeAccounts.update({ _id:accountId }, { $set:set });

          	this.distribute(accountId, distributionName);
          }
          else {
			  		d_('Stopping recursion - no more debt left');

			  		if (distributionName === 'revenue') {
			  			// We only consider sending revenue to the shared account we are actually distributing revenue.

				  		if (excess > 0) {
					  		d_('Sending excess revenue to shared account: ' + excess);

					  		// Zero the remainder pool.
			          TimeAccounts.update({ _id:accountId }, { $set:{ revenue:0 } });

			          // Sending excess to shared account.
			          d_('Incrementing shared credit by ' + excess);
								TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:{ credit:excess } });

						  	d_('\nFinal distribution');
						  	d_(_activeDistribution(TimeAccounts.findOne({ _id:accountId }), 'revenue'));
					  		h_.distributeDividends();
				  		}
				  		else {
					  		d_('No excess left either - no need to send anything to the shared account');
						  	d_('\nFinal distribution');
						  	d_(_activeDistribution(TimeAccounts.findOne({ _id:accountId }), 'revenue'));
				  		}
			  		}
			  		else {
			  			d_('Not distributing revenue - Will not be sending anything to the shared account');
			  		}
          }
		  	}
		  	else {
		  		d_('Stopping recursion - cannot distribute leftover revenue - not enough remaining: Remainder pool: ' + remainderPool);

		  		if (distributionName === 'revenue') {
			  		d_('Will not send excess revenue to shared account');
		  		}
		  		else if (distributionName === 'dividends') {
			  		var account = TimeAccounts.findOne({ _id:accountId });
			  		d_(account.contributions);



		  		}

			  	d_('\nFinal distribution');
			  	d_(_activeDistribution(account, distributionName));

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

    h_.collideSharedTimeAccount();

		// Finds an amount that can be evenly distributed to every user.
		// Exclude the shared time account and include only active accounts during distribution.
		var activeAccounts = TimeAccounts.find({ $and: [{ liabilityLimit:{ $exists:false } }, { status:'active' }] });
		var count = activeAccounts.count();

  	d_('\nDistributing dividends to ' + count + ' active accounts');

		if (count > 0) {

  		sharedAccount = h_.sharedAccount();
	  	d_(sharedAccount);

			var remainder = sharedAccount.credit % count;
			var divisibleFund = sharedAccount.credit - remainder;
			var dividendAmount = divisibleFund / count;

			var remainingAmountToDistribute = divisibleFund;

			d_('\nShared credit to distribute: ' + sharedAccount.credit + ', Dividend share: ' + dividendAmount + ', Amount to distribute: ' + remainingAmountToDistribute);


	  	var accountId;
  		activeAccounts.map(function(account) {

  			accountId = account._id;

  			// Moves credit from shared account to this account.
        TimeAccounts.update({ _id:accountId }, { $inc:{ dividends:dividendAmount } });
				remainingAmountToDistribute -= dividendAmount;

				d_('Distributing dividend to ' + accountId + '...');
  			h_.distribute(account._id, 'dividends');
  		});

			remainingAmountToDistribute += remainder;
  		d_('Divisible fund: ' + divisibleFund + ', Remainder: ' + remainder + ', New shared credit: ' + remainingAmountToDistribute);

			TimeAccounts.update({ _id:sharedAccount._id }, { $set:{ credit:remainingAmountToDistribute } });


			// TimeAccounts.find({ $and: [{ liabilityLimit:{ $exists:false } }, { status:'active' }] })
			// 	.map(function(account) {
			// 		// Grants dividend to each member.
			// 		var accountId = account._id;
			// 		d_(accountId);
					
			// 		// var excessCredit = h_.applyCreditToDebt(accountId, dividendAmount);
			// 		// TimeAccounts.update({ _id:accountId }, { $inc:{ credit:excessCredit } });
			// 		// amountNotDistributed -= dividendAmount;
					
			// 	});

			// // The remainder of shared credit stays in the shared account for later 
			// // 	distribution (after more shared credit accumulates).
			// amountNotDistributed += remainder;
			// TimeAccounts.update({ _id:sharedAccount._id }, { $set:{ credit:amountNotDistributed } });

		}
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

								// Add the payment amount to the payee's revenue.
								TimeAccounts.update({ _id:payeeAccount._id }, { $inc:{ credit:amount } });

								// Now, distribute the revenue for the payee.
								h_.distribute(payeeAccount._id, 'revenue');

								// Now we deduct the amount of the payment from the payee's debt.
								// var excessCredit = h_.applyCreditToDebt(payeeAccountId, amount);

								// Any excess credit is shared, and goes into the shared time account.
								// TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:{ credit:excessCredit } });

								// Distribute shared credit.
								// h_.distributeDividends();

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






