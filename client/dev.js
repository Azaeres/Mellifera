if (Helpers.isDevelopment()) {
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
    freezeTimeAccount: function() {
      var timeAccount = h_.timeAccount();
      Meteor.call('FreezeTimeAccount', timeAccount._id, function(error, result) {
        (typeof error === 'undefined') ? d_(result) : d_(error);
      });
      return 'Freezing time account...';
    },
    activateTimeAccount: function(email) {
      Meteor.call('ActivateTimeAccount', email, function(error, result) {
        (typeof error === 'undefined') ? d_(result) : d_(error);
      });
      return 'Activating time account...';
    },
    setupTestEnvironment: function(callback) {
      Meteor.call('SetupTestEnvironment', callback);
      return 'Setting up test environment...';
    },
    paymentBetweenAccounts: function(payerId, payeeId, amount) {
    },
    payment: function(payeeAccountEmail, amount) {
      Meteor.call('MakePayment', payeeAccountEmail, amount, function(error, result) {
        (typeof error === 'undefined') ? d_(result) : d_(error);
      });
      
      return 'Processing payment...';
    },
    applyCreditToDebt: function() {
      return h_.call('ApplyCreditToDebt', 'Applying credit...');
    },
    distributeDividends: function() {
      return h_.call('DistributeDividends', 'Distributing dividends...');
    },
    call: function(serverMethodName, displayText) {
      var output = serverMethodName;
      if (typeof displayText == 'string') {
        output = displayText;
      }

      Meteor.call(serverMethodName, function(error, result) {
        (typeof error === 'undefined') ? d_(result) : d_(error);
      });
      
      return output;
    },
    testContribution: function(callback) {
      Meteor.call('TestContribution', callback);
      return 'Testing contribution...';
    },
    runTests: function(suite) {
      Meteor.call('RunTests', suite, function(error, result) {
        (typeof error === 'undefined') ? d_(result) : d_(error);
      });

      return 'Running tests...';
    },
    distributeRevenue: function() {
      Meteor.call('DistributeRevenue', function(error, result) {
        (typeof error === 'undefined') ? d_(result) : d_(error);
      });
    },
    /*,
    distributeRevenue: function(debts, revenue) {
      var result = { newDebts:debts, excessRevenue:0 };

      // Make sure the revenue amount is valid.
      if (h_.isInteger(revenue) && revenue > 0) {
        result.excessRevenue = revenue;

        // Divide amount evenly, keeping track of remainder.
        var count = _.size(result.newDebts);
        var remainder = revenue % count;
        var divisibleAmount = revenue - remainder;

        if (divisibleAmount > 0) {
          // Find the amount to distribute this pass.
          var shareAmount = divisibleAmount / count;

          // We start with whatever we're not distributing, and gather excess revenue from there.
          result.excessRevenue = remainder;

          // Apply the share amount to each debt.
          var debtLeft = 0;
          _.map(debts, function(debtAmount, timeAccountId) {
            var update = 0;

            // Find out how much debt would be left over after applying the share amount to it.
            var newDebt = debtAmount - shareAmount;

            // If the leftover debt is negative, we have overflow and need to gather it up for the next pass.
            if (newDebt < 0) {
              // Debt cannot be less than zero.
              update = 0;

              // Gather excess revenue.
              result.excessRevenue += Math.abs(newDebt);
            }
            else {
              // No overflow, so just set the new debt amount.
              update = newDebt;
            }

            result.newDebts[timeAccountId] = update;
            debtLeft += update;
          });

          // Recursively attempts another pass.
          if (debtLeft > 0) {
            result = this.distributeRevenue(result.newDebts, result.excessRevenue);
          }
        }
      }

      return result;
    }*/
  });

  Meteor.autosubscribe(function () {
    Meteor.subscribe('Tests');
  });

}


