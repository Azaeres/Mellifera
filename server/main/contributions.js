



_.extend(Helpers, {

	recordContribution: function(contributorAccountId, amount, businessAccountId) {

		var contributionId;

		if (amount > 0) {
			var contributionId = Contributions.insert({
				contributorAccountId: contributorAccountId,
				businessAccountId: businessAccountId,
				dateReported: new Date(),
				amountReported: amount,
				dateActivated: null,
				amountOutstanding: amount
			});

			// Hook the contribution up to the time accounts.
			var set = {};
			set['contributions.'+businessAccountId] = contributionId;
			TimeAccounts.update({ _id:contributorAccountId }, { $push:set });

			set = {};
			set['contributors.'+contributorAccountId] = contributionId;
			TimeAccounts.update({ _id:businessAccountId }, { $push:set });
		}

		return contributionId;
	},


	activateContribution: function(contributionId) {
		Contributions.update({ _id:contributionId }, { $set:{ dateActivated:new Date() } });
	},

	removeContribution: function(contributionId) {

		// Remove association from business account.
		var contribution = Contributions.findOne({ _id:contributionId });
		if (!_.isUndefined(contribution)) {
			var contributorAccountId = contribution.contributorAccountId;

			var businessAccountId = contribution.businessAccountId;
			var businessAccount = TimeAccounts.findOne({ _id:businessAccountId });

			var numContributors = businessAccount.contributors[contributorAccountId].length;

			if (numContributors <= 1) {
				var unset = {};
				unset['contributors.'+contributorAccountId] = 1;
				TimeAccounts.update({ _id:businessAccountId }, { $unset:unset });
			}
			else {
				var pull = {};
				pull['contributors.'+contributorAccountId] = contributionId;
				TimeAccounts.update({ _id:businessAccountId }, { $pull:pull });
			}






			// Remove association from contributor account.
			
			var contributorAccountId = contribution.contributorAccountId;
			var contributorAccount = TimeAccounts.findOne({ _id:contribution.contributorAccountId });

			var numContributions = contributorAccount.contributions[businessAccountId].length;

			if (numContributions <= 1) {
				var unset = {};
				unset['contributions.'+businessAccountId] = 1;
				TimeAccounts.update({ _id:contributorAccountId }, { $unset:unset });
			}
			else {
				var pull = {};
				pull['contributions.'+businessAccountId] = contributionId;
				TimeAccounts.update({ _id:contributorAccountId }, { $pull:pull });
			}




			// Remove the contribution.
			Contributions.remove({ _id:contributionId });
		}
	}



});
