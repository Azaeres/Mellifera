



_.extend(Helpers, {

	recordContribution: function(contributorAccountId, amount, businessAccountId) {

		var contributionId = Contributions.insert({ 
			contributorAccountId:contributorAccountId,
			businessAccountId:businessAccountId,
			amount:amount,
			dateReported:new Date(),
			dateAccepted:null
		});

		// Hook the contribution up to the time accounts.
		var set = {};
		set['contributions.'+businessAccountId] = contributionId;
		TimeAccounts.update({ _id:contributorAccountId }, { $push:set });

		set = {};
		set['contributors.'+contributorAccountId] = contributionId;
		TimeAccounts.update({ _id:businessAccountId }, { $push:set });

		return contributionId;
	},


	acceptContribution: function(contributionId) {
		Contributions.update({ _id:contributionId }, { $set:{ dateAccepted:new Date() } });
	},

	denyContribution: function(contributionId) {

		// Remove association from business account.
		var contribution = Contributions.findOne({ _id:contributionId });
		var contributorAccountId = contribution.contributorAccountId;
		d_(contribution);

		var businessAccount = TimeAccounts.findOne({ _id:contribution.businessAccountId });
		var numContributors = businessAccount.contributors[contributorAccountId].length;
		d_(businessAccount.contributors[contributorAccountId].length);

		if (numContributors <= 1) {
			var unset = {};
			unset['contributors.'+contributorAccountId] = 1;
			TimeAccounts.update({ _id:contribution.businessAccountId }, { $unset:unset });
		}
		else {
			var pull = {};
			pull['contributors.'+contributorAccountId] = contributionId;
			TimeAccounts.update({ _id:contribution.businessAccountId }, { $pull:pull });
		}

		// Remove association from contributor account.
		

		// var filteredContributors = _.filter(contributors, function(value) {
		// 	return (value === contributorAccountId);
		// });
		// d_(filteredContributors);


	}




});