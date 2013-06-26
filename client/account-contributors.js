(function() {

  Template.contributors.helpers({
  	revenueShares: function() {
  		var account = h_.timeAccount();

  		if (!_.isUndefined(account)) {
  			var contributorIds = _.keys(account.contributors);

  			var info = [];
  			_.each(contributorIds, function(contributorId) {
  				var contributorAccount = TimeAccounts.findOne(contributorId);
  				info.push(contributorAccount.owner);
  			});


	  		Meteor.call('EmailsForUserAccountIds', info, function(error, contributorEmails) {

	  			var contributors = [];
	  			_.each(contributorEmails, function(contributorEmail, index) {
	  				var contributor = {};
	  				contributor.id = contributorIds[index];
	  				contributor.email = contributorEmail;
	  				contributors.push(contributor);

	  				var contributions = [];
	  				var contributionIds = account.contributors[contributor.id];
	  				_.each(contributionIds, function(contributionId) {
	  					var contribution = Contributions.findOne(contributionId);
	  					if (!_.isUndefined(contribution)) {
		  					contribution.amountOutstanding = h_.hoursFromCents(contribution.amountOutstanding);
		  					contribution.amountReported = h_.hoursFromCents(contribution.amountReported);
		  					
		  					if (_.isNull(contribution.dateActivated)) {
		  						contribution.inactive = true;
		  					}
		  					else {
		  						contribution.inactive = false;
		  					}

		  					contributions.push(contribution);
	  					}
	  				});

	  				contributor.contributions = contributions;
	  			});

	  			Session.set('Contributors', contributors);
	  		});

	  		

				return Session.get('Contributors');
  		}
  	}
  });

	Template.contributors.events({
		'click .shares .deny': function(event) {
			var contributionId = $(event.target).closest('.contribution').data('contribution-id');
			Meteor.call('RemoveContribution', contributionId);
		}
	});


	Template.contributions.helpers({
  	revenueSources: function() {
  		var account = h_.timeAccount();

  		if (!_.isUndefined(account)) {
  			var contributorIds = _.keys(account.contributions);

  			var info = [];
  			_.each(contributorIds, function(contributorId) {
  				var contributorAccount = TimeAccounts.findOne(contributorId);
  				info.push(contributorAccount.owner);
  			});

	  		Meteor.call('EmailsForUserAccountIds', info, function(error, contributorEmails) {

	  			var contributors = [];
	  			_.each(contributorEmails, function(contributorEmail, index) {

	  				var contributor = {};
	  				contributor.id = contributorIds[index];
	  				contributor.email = contributorEmail;
	  				contributors.push(contributor);

	  				var contributions = [];
	  				var contributionIds = account.contributions[contributor.id];

	  				_.each(contributionIds, function(contributionId) {
	  					var contribution = Contributions.findOne(contributionId);
	  					if (!_.isUndefined(contribution)) {
		  					contribution.amountOutstanding = h_.hoursFromCents(contribution.amountOutstanding);
		  					contribution.amountReported = h_.hoursFromCents(contribution.amountReported);
		  					
		  					if (_.isNull(contribution.dateActivated)) {
		  						contribution.inactive = true;
		  					}
		  					else {
		  						contribution.inactive = false;
		  					}

		  					contributions.push(contribution);
	  					}
	  				});

	  				contributor.contributions = contributions;
	  			});

	  			Session.set('Contributions', contributors);
	  		});

	  		

				return Session.get('Contributions');
  		}
  	}
  });

	Template.contributions.events({
		'click .sources .cancel': function(event) {
			var contributionId = $(event.target).closest('.contribution').data('contribution-id');
			Meteor.call('RemoveContribution', contributionId);
		}
	});


})();