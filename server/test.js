_.extend(Helpers, {
  /** FOR TESTING
   * Zeroes the logged-in user's time account.
   */
  wipeAccount: function() {
    var userId = Meteor.userId();
    if (typeof userId !== 'undefined') {
      TimeAccounts.update({ owner:userId }, { $set:{ credit:0, debt:0, dividends:0 }});
    }

    return 'Account wiped.'
  },
  /** FOR TESTING
   * Generously adds 10 hours to the shared time account.
   */
  boostSharedCredit: function() {
  	TimeAccounts.update({ owner:null }, { $inc:{ credit:1000, debt:1000 } });
  }
});

Meteor.methods({
	WipeAccount: function() {
		return h_.wipeAccount();
	},
	BoostSharedCredit: function() {
		return h_.boostSharedCredit();
	}
});
