_.extend(Helpers, {
  wipeAccount: function() {
    return h_.call('WipeAccount', 'Wiping account...');
  },
  wipeAllAccounts: function() {
    return h_.call('WipeAllAccounts', 'Wiping all accounts...');
  },
  boostSharedAccount: function() {
    return h_.call('BoostSharedAccount', 'Boosting shared time account...');
  },
  collideSharedAccount: function() {
    return h_.call('CollideSharedAccount', 'Colliding shared time account...');
  },
  collideAccount: function() {
    return h_.call('CollideAccount', 'Colliding user account...');
  },
  setLiabilityLimit: function(newLimit) {
    Meteor.call('SetLiabilityLimit', newLimit, function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Setting liability limit...';
  },
  seizeDebt: function(amount) {
    var timeAccount = h_.timeAccount();
    Meteor.call('SeizeDebt', timeAccount._id, amount, function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Seizing debt...';
  },
  freezeTimeAccount: function(accountId) {
    var timeAccount = h_.timeAccount();
    Meteor.call('FreezeTimeAccount', timeAccount._id, function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Freezing time account...';
  },
  activateTimeAccount: function(accountId) {
    var timeAccount = h_.timeAccount();
    Meteor.call('ActivateTimeAccount', timeAccount._id, function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Activating time account...';
  }
});

