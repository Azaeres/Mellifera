

_TESTING = false;

(function(flag) {
	if (flag === 1)
		_TESTING = true;
})();	// <- Pass in `1` to run tests.


if (_TESTING) {
	TimeAccounts = new Meteor.Collection('TestTimeAccounts');
}
else {
	TimeAccounts = new Meteor.Collection('TimeAccounts');
}

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
  }
};

// Helper shortcuts.
// 
h_ = Helpers;
d_ = console.log.bind(console);
l_ = h_.localString;
