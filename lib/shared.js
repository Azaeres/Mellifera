var d_ = function(str) {
  if (typeof console !== 'undefined')
    console.log(str);
};

TimeAccounts = new Meteor.Collection('TimeAccounts');

Helpers = {
	/**
	 * Returns the universal liability limit.
	 * Returns null if it hasn't been set.
	 */
	liabilityLimit: function() {
		var sharedAcct = TimeAccounts.findOne({ owner:null });
		var liabilityLimit = null;
		if (typeof sharedAcct !== 'undefined') {
			liabilityLimit = sharedAcct.liabilityLimit;
		}

		return liabilityLimit;
	}
};
h_ = Helpers;
