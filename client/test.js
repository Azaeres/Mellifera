_.extend(Helpers, {
  wipeAccount: function() {
    Meteor.call('WipeAccount', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Wiping account...';
  },
  boostSharedCredit: function() {
    Meteor.call('BoostSharedCredit', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Boosting shared credit...';
  }
});
