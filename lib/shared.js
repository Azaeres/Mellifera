
TimeAccounts = new Meteor.Collection('TimeAccounts');

Helpers = {
	localString: function(str) {
		var locale = Session.get('locale');
	//	String.locale = locale;
		return str;
	},
	/**
	 * Returns the universal liability limit.
	 * Returns null if it hasn't been set.
	 */
	liabilityLimit: function() {
		var liabilityLimit;

		var sharedAcct = h_.sharedAccount();
		if (typeof sharedAcct != 'undefined') {
			liabilityLimit = sharedAcct.liabilityLimit;
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
  isDevelopment: function() {
    var result = false;

    if (typeof Meteor.settings !== 'undefined' && typeof Meteor.settings.public !== 'undefined') {
      result = Meteor.settings.public.env === 'development';
    }

    return result;
  },
  getContributionAmount: function(accountId, contributorAccountId) {
    var result = 0;
    var account = TimeAccounts.findOne({ _id:accountId });

    // Make sure the account is valid and active.
    if (typeof account != 'undefined') {
      if (typeof contributorAccountId === 'undefined') {
        contributorAccountId = accountId;
      }

      var contribution = account.contributions[contributorAccountId];
      if (typeof contribution != 'undefined') {
        result = contribution.amount;
      }
    }
    else
      throw new Meteor.Error(500, 'Failed to get contribution amount. Account not found.');

    return result;
  }
};

if (Helpers.isDevelopment()) {
  Tests = new Meteor.Collection('Tests');
}

// Helper shortcuts.
// 
h_ = Helpers;
d_ = console.log.bind(console);
l_ = h_.localString;

