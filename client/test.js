_.extend(Helpers, {
  wipeAccount: function() {
    Meteor.call('WipeAccount', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Wiping account...';
  },
  boostSharedAccount: function() {
    Meteor.call('BoostSharedAccount', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Boosting shared time account...';
  },
  collideSharedAccount: function() {
    Meteor.call('CollideSharedAccount', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Colliding shared time account...';
  },
  collideAccount: function() {
    Meteor.call('CollideAccount', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Colliding user account...';
  }
});
