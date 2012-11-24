_.extend(Helpers, {
  /** FOR TESTING
   * Zeroes the logged-in user's time account.
   */
  wipeAccount: function() {
    var userId = Meteor.userId();
    if (typeof userId !== 'undefined') {
      TimeAccounts.update({ owner:userId }, { $set:{ credit:0, debt:0 }});
    }

    return 'Account wiped.'
  },
  wipeAllAccounts: function() {
    TimeAccounts.update({}, { $set:{ credit:0, debt:0 } }, { multi:true });

    //TimeAccounts.update({ liabilityLimit:{ $exists:false } }, { $set:{ credit:6000, debt:6000 } }, { multi:true });
    //TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $set:{ credit:0, debt:0 } });
  },
  /** FOR TESTING
   * Generously adds 10 hours to the shared time account.
   */
  boostSharedCredit: function() {
  	TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:{ credit:1000, debt:1000 } });

    return 'Shared time account boosted.';
  }
});

Meteor.methods({
	WipeAccount: function() {
		return h_.wipeAccount();
	},
  WipeAllAccounts: function() {
    return h_.wipeAllAccounts();
  },
	BoostSharedAccount: function() {
		return h_.boostSharedCredit();
	},
  CollideSharedAccount: function() {
    var sharedAcct = h_.sharedAccount();
    h_.collideTimeAccount(sharedAcct._id);

    return 'Shared time account collided.';
  },
  CollideAccount: function() {
    var timeAcctId = h_.userTimeAccountId();
    h_.collideTimeAccount(timeAcctId);

    return 'Time account collided.';
  },
  SetLiabilityLimit: function(newLimit) {
    h_.setLiabilityLimit(newLimit);
  },
  SeizeDebt: function(accountId, amount) {
    h_.seizeDebt(accountId, amount);
  },
  FreezeTimeAccount: function(accountId) {
    h_.freezeTimeAccount(accountId);
  },
  ActivateTimeAccount: function(accountId) {
    h_.activateTimeAccount(accountId);
  }
});
