if (1/*_TESTING*/) {
  Meteor.publish('TestTimeAccounts', function () {
    return TimeAccounts.find();
  });

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

      return 'All accounts wiped.';
    },
    /** FOR TESTING
     * Generously adds 10 hours to the shared time account.
     */
    boostSharedCredit: function() {
      TimeAccounts.update({ liabilityLimit:{ $exists:true } }, { $inc:{ credit:1000, debt:1000 } });

      return 'Shared time account boosted.';
    },
    setupTestEnvironment: function() {
      var results = {};

      // Removes all accounts, including the shared account.
      TimeAccounts.remove({});

      // Creates the shared account.
      var sharedAccountId = h_.createSharedTimeAccount();
      results.sharedAccount = TimeAccounts.findOne(sharedAccountId);

      // Creates 100 zombie accounts.
      //_.range(100).map(function(i) {
      //  h_.timeAccount();
      //});

      // Gives all the accounts some money.
      //TimeAccounts.update({ liabilityLimit:{ $exists:false } }, { $set:{ status:'active', credit:6000, debt:6000 } }, { multi:true });

      return results;
    },
    testContribution: function() {
      var results = {};
      
      // Get a dummy user.
      var testUsername = '0d86a0d3-2baa-4fe5-9bda-7603003720a8-test-';
      var testUser = Meteor.users.findOne({ username:testUsername });
      if (typeof testUser == 'undefined') {
        results.testUserId = Accounts.createUser({ username:testUsername })

        // Create a test account.
        var contributor = h_.timeAccount(results.testUserId);
        results.contributorAfterCreation = TimeAccounts.findOne(contributor._id);

        // Try to contribute to a frozen account.
        results.contributionAmount = 8000;
        try {
          h_.contribute(contributor._id, results.contributionAmount);
        }
        catch(error) {
          results.contributionError1 = error;
        }

        results.contributorAfterFailedContribution = TimeAccounts.findOne(contributor._id);

        // Activate the test account.
        h_.activateTimeAccount(contributor._id);
        results.contributorAfterActivation = TimeAccounts.findOne(contributor._id);

        // Try to contribute to the newly activated account.
        try {
          h_.contribute(contributor._id, results.contributionAmount);
        }
        catch(error) {
          results.contributionError2 = error;
        }

        results.contributorAfterSuccessfulContribution = TimeAccounts.findOne(contributor._id);

        // Freeze the time account again.
        h_.freezeTimeAccount(contributor._id);
        results.contributorAfterFreeze = TimeAccounts.findOne(contributor._id);

        // Try to activate/freeze an invalid id.
        try {
          h_.activateTimeAccount('invalid-id');
        }
        catch(e) {
          results.activateInvalidIdError = e;
        }

        try {
          h_.freezeTimeAccount('invalid-id');
        }
        catch(e) {
          results.freezeInvalidIdError = e;
        }

        // Try to contribute to an invalid id.
        try {
          h_.contribute('invalid-id', results.contributionAmount);
        }
        catch(e) {
          results.contributeInvalidIdError = e;
        }
        
        Meteor.users.remove(results.testUserId);
      }
      else {
        results.testUserId = testUser._id;
        results.createUserError = new Meteor.Error(500, 'Test user "'+testUsername+'" already exists');
      }

      return results;
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

      return 'Liability limit set.';
    },
    SeizeDebt: function(accountId, amount) {
      h_.seizeDebt(accountId, amount);

      return 'Debt seized.';
    },
    FreezeTimeAccount: function(accountId) {
      h_.freezeTimeAccount(accountId);

      return 'Time account frozen.';
    },
    ActivateTimeAccount: function(accountId) {
      h_.activateTimeAccount(accountId);

      return 'Time account activated.';
    },
    SetupTestEnvironment: function() {
      return h_.setupTestEnvironment();
    },
    TestContribution: function() {
      return h_.testContribution();
    }
  });
}

