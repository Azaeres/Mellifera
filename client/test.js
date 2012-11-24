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
  }
});

(function() {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    execJasmine();
  };

  function execJasmine() {
    jasmineEnv.execute();
  }

})();

