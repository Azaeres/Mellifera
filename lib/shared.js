TimeAccounts = new Meteor.Collection('TimeAccounts');

Helpers = {
	localString: function(str) {
		var locale = Session.get('locale');
	//	String.locale = locale;
		return str;
	},
	consoleLog: function(str) {
	  if (typeof console !== 'undefined')
	    console.log(str);
	},
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

// Helper shortcuts.
// 
h_ = Helpers;
d_ = h_.consoleLog;
l_ = h_.localString;
