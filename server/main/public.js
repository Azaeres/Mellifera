

/**
 * Public server methods.
 */

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
	ReportContribution: function(contributeToEmail, amount) {
		var result = 0;

		var fromAccountId = h_.userTimeAccountId();
		if (!_.isNull(fromAccountId)) {

			var toAccountId = fromAccountId;
			if (!_.isEmpty(contributeToEmail)) {

				var contributeToUser = Meteor.users.findOne({ 'emails.address':contributeToEmail });
				if (!_.isUndefined(contributeToUser)) {

					var contributeToAccount = TimeAccounts.findOne({ owner:contributeToUser._id });
					if (!_.isUndefined(contributeToAccount)) {
						toAccountId = contributeToAccount._id;
					}
					else
						throw new Meteor.Error(500, 'Found no time account for that user.');
				}
				else
					throw new Meteor.Error(500, 'Found no user account with that email address.');
			}

			result = h_.contribute(fromAccountId, amount, toAccountId);
		}
		else
			throw new Meteor.Error(500, 'The logged-in user doesn\'t have a time account.');

		return result;
	},





	MakePayment: function(payeeEmail, amount) {
		var result = false;
		var timeAccount;
  	var payerAccount = h_.userTimeAccount();
  	if (typeof payerAccount != 'undefined') {
			var payeeAccount = Meteor.users.findOne({ 'emails.address':payeeEmail });
			if (typeof payeeAccount != 'undefined') {
				timeAccount = TimeAccounts.findOne({ owner:payeeAccount._id });
				if (typeof timeAccount != 'undefined') {
					result = h_.payment(payerAccount._id, timeAccount._id, amount);
				}
				else
					throw new Meteor.Error(500, 'Found no time account for that user.');
			}
			else
				throw new Meteor.Error(500, 'Found no user account with that email address.');
  	}
		else
			throw new Meteor.Error(500, 'The logged-in user doesn\'t have a time account.');

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
			});
		}

		return info;
	},






	EmailsForUserAccountIds: function(userAccountIds) {
		var info = [];

		if (!_.isUndefined(userAccountIds)) {
			if (_.isArray(userAccountIds)) {
				_.each(userAccountIds, function(userAccountId) {
					var userAccount = Meteor.users.findOne(userAccountId);
					info.push(_.first(userAccount.emails).address);
				});
			}
		}

		return info;
	},





	ActivateContribution: function(contributionId) {
		h_.activateContribution(contributionId);
	},

	RemoveContribution: function(contributionId) {
		// Remove the locked credit associated with this contribution.
		var contribution = Contributions.findOne({ _id:contributionId });
		if (!_.isUndefined(contribution)) {
			var contributorAccountId = contribution.contributorAccountId;
			var amount = contribution.amountOutstanding;
			TimeAccounts.update({ _id:contributorAccountId }, { $inc:{ credit:-amount } });

			h_.removeContribution(contributionId);
		}
	}









	/*
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
	}*/
});
