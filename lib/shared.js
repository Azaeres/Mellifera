
TimeAccounts = new Meteor.Collection('TimeAccounts');

if (Meteor.settings.public.env === 'testing') {
  TestTimeAccounts = new Meteor.Collection('TestTimeAccounts');
}





Helpers = {



	/**
	 * Returns the universal liability limit.
	 * Returns `undefined` if it hasn't been set.
	 */
	liabilityLimit: function() {
		var liabilityLimit;

    // The liability limit is stored on the shared account.
		var sharedAccount = h_.sharedAccount();
		if (!_.isUndefined(sharedAccount)) {
			liabilityLimit = sharedAccount.liabilityLimit;
		}

		return liabilityLimit;
	},





  /**
   * Returns the shared time account.
   */
  sharedAccount: function() {
	 return TimeAccounts.findOne({ liabilityLimit:{ $exists:true } });
  },



  isInteger: function(value) {
    return typeof value === 'number' && parseFloat(value) == parseInt(value, 10) && !isNaN(value);
  },



  queryUsersRegex: function(str) {
    var arr, newStr, s;
    s = str || '';
    s = s.replace(RegExp(' ', 'g'), '');
    arr = s.split('');
    newStr = '';
    
    _.map(arr, function(ch) {
      ch = ch + '.*';
      return newStr += ch;
    });

    return RegExp(newStr, 'i');
  },





  inDevelopmentEnvironment: function() {
    var result = false;

    if (typeof Meteor.settings !== 'undefined' && typeof Meteor.settings.public !== 'undefined') {
      result = Meteor.settings.public.env === 'development';
    }

    return result;
  },

  inTestingEnvironment: function() {
    var result = false;

    if (!_.isUndefined(Meteor.settings) && !_.isUndefined(Meteor.settings.public)) {
      result = Meteor.settings.public.env === 'testing';
    }

    return result;
  },



  /**
   * Contributor Format
   * ==================
   *
   * contributors: {
   *  '<contributorTimeAccountId>': [
   *   { dateRequested, requestAmount,
   *     dateAccepted, outstandingAmount },
   *   { ... }
   *  ]
   * }
   *
   * `dateRequested` must be set to the date the contribution was requested.
   * `requestAmount` must be set to the contribution amount that was requested.
   *
   * `dateAccepted` is null if it hasn't been accepted, or set to the date 
   *   it was accepted. If the contribution is rejected, it is removed.
   *
   * `outstandingAmount` is initially set to the `requestAmount`, and is 
   *   decremented as it receives revenue. When it reaches zero, the contribution
   *   is removed.
   *
   * The contribution array is sorted by oldest contribution first.
   */


  /*
  Returns the total outstanding, accepted contributions.
  */
  getTotalOutstandingContributionAmount: function(accountId) {
    var sumTotal = 0;

    var account = TimeAccounts.findOne({ _id:accountId });

    // Make sure the account is valid.
    if (!_.isUndefined(account)) {

      _.map(account.contributors, function(contributor) {
        sumTotal += contributor.amount;
      });

    }
    else
      throw new Meteor.Error(500, 'Failed to get total contribution amount. Account not found.');

    return sumTotal;
  },

  /*
  Returns the total outstanding, accepted contributions for a given contributor.
  */
  getOutstandingContributionAmount: function(accountId, contributorAccountId) {
    var sumTotal = 0;

    var contributions = this.getContributions(accountId, contributorAccountId);
    if (_.isArray(contributions)) {

      // Filters out all the non-accepted contributions.
      var acceptedContributions = _.filter(contributions, function(contribution) {
        return _.isDate(contribution.dateAccepted);
      });

      // Collects all the accepted amounts.
      var acceptedContributionAmounts = _.pluck(acceptedContributions, 'outstandingAmount');

      // Sums up the contributor's outstanding contributions.
      sumTotal = _.reduce(acceptedContributionAmounts, function(memo, amount) {
        return memo + amount;
      }, 0);
    }

    return sumTotal;
  },

  /*
  Returns the array of contributions for a given account and a given contributor.
  */
  getContributions: function(accountId, contributorAccountId) {
    var result;
    var account = TimeAccounts.findOne({ _id:accountId });

    // Make sure the account is valid.
    if (!_.isUndefined(account)) {
      if (_.isUndefined(contributorAccountId)) {

        // If a contributor wasn't specified, then we'll get the 
        // contributions they've made to themselves.
        contributorAccountId = accountId;
      }

      result = account.contributors[contributorAccountId];
    }
    else
      throw new Meteor.Error(500, 'Failed to get contributions. Account not found.');

    return result;
  }


};






// Helper shortcuts.
// 
h_ = Helpers;
d_ = console.log.bind(console);




