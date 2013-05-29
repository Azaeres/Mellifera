(function() {



  _.extend(Helpers, {

    wipeSlate: function() {
      TimeAccounts.remove({});
      h_.createSharedTimeAccount();

      Contributions.remove({});
    },

    // Creates a dummy user with a given `email` and `password`.
    // Returns the `userId` of the created user.
    // If one already exists with the given email, it just returns 
    // the userId of that user.
    createDummyUser: function(email, password) {
      var user = h_.findUserByEmail(email);
      var userId;
      if (_.isUndefined(user)) {

        if (_.isUndefined(password)) {
          password = 'password'
        }

        userId = Accounts.createUser({
          email: email,
          password: 'password'
        });
      }
      else {
        userId = user._id;
      }

      h_.timeAccount(userId);
      h_.activateTimeAccount(email);

      return userId;
    },



    runTests: function() {
  
      (new SnapChain())

      .snap('Creating dummy users', function() {

        d_('Running tests...');

        h_.wipeSlate();

        this.emails = [
          'azaeres@gmail.com', 
          'ryanb@fullscreen.net',
          'bob@aol.com',
          'peter@aol.com'
        ];

        var accounts = [];

        _.each(this.emails, function(email) {
          h_.createDummyUser(email, 'password');
          accounts.push(h_.findTimeAccountByEmail(email));
        });

        this.accounts = accounts;

        this.return({
          gather: function() {
            this.return({
              userCount: Meteor.users.find().count(),
              timeAccountCount: TimeAccounts.find().count()
            });
          }, 
          expect: {
            userCount: 4,
            timeAccountCount: 5
          }
        });

      })




      .snap('Contributions', function() {

        h_.contribute(this.accounts[0]._id, 500);
        h_.contribute(this.accounts[0]._id, 400);
        h_.contribute(this.accounts[0]._id, 200);

        h_.contribute(this.accounts[1]._id, 500, this.accounts[0]._id);
        h_.contribute(this.accounts[2]._id, 300, this.accounts[0]._id);
        h_.contribute(this.accounts[3]._id, 100, this.accounts[0]._id);

        var emails = this.emails;

        this.return({
          gather: function() {

            var account = h_.findTimeAccountByEmail(emails[0]);

            this.return({
              contributorCount:_.size(account.contributors)
            });
          },
          expect: {
            contributorCount:4
          }
        });
      })

      .snap('Accept contributions', function() {

        var account = TimeAccounts.findOne(this.accounts[0]._id);
        var accountId = account._id;

        var arr = [];

        arr.push(account.contributors[accountId][1]);
        arr.push(account.contributors[accountId][2]);
        arr.push(account.contributors[this.accounts[2]._id][0]);
        arr.push(account.contributors[this.accounts[3]._id][0]);

        _.each(arr, function(contributionId) {
          h_.activateContribution(contributionId);
        });

        this.acceptedContributions = arr;

        this.return();
      })

      .snap('Deny contributions', function() {

        // h_.removeContribution(this.acceptedContributions[3]);
        // h_.removeContribution(this.acceptedContributions[1]);

        this.return();
      })

      .snap('Give revenue', function() {

        var gift = 8;
        this.gift = gift;

        h_.giftRevenue(this.accounts[0]._id, gift);
        var emails = this.emails;

        this.return({
          gather: function() {

            var account = h_.findTimeAccountByEmail(emails[0]);

            this.return({
              revenue:account.revenue
            });
          },
          expect: {
            revenue:gift
          }
        });
      })


      .snap('Distribute revenue', function() {

        var businessAccountId = this.accounts[0]._id;
        h_.distributeRevenue(businessAccountId);

        var gift = this.gift;

        this.return({
          gather: function() {

            var businessAccount = TimeAccounts.findOne({ _id:businessAccountId });

            // d_(businessAccount);
            var results = [];
            _.map(businessAccount.contributors, function(contributions) {
              _.map(contributions, function(contributionId) {
                var contribution = Contributions.findOne({ _id:contributionId });
                // d_(contribution);
                results.push({ 
                  isActivated:!_.isNull(contribution.dateActivated),
                  amountRemunerated:contribution.amountReported - contribution.amountOutstanding,
                  amountReported:contribution.amountReported
                });
              });
            });

            this.return({
              contributions:results,
              revenue:businessAccount.revenue,
              revenueDistributed:gift - businessAccount.revenue
            });
          },
          expect: {
            foo:'bar'
          }
        });
      })


      .snap(function() {
        d_('Tests complete.');
        this.return();
      });


      /*
      var snapshot = { foo:'bar' };
      var anotherSnapshot = { bar:'baz' };

      (new SnapChain())

      .snap('one', function() {

        this.return({
          gather: function() {
            this.return(snapshot);
          }, 
          expect: {
            foo:'bar'
          }
        });

      })

      .snap('two', function() {

        snapshot.foo = 12;

        this.return({
          expect: {
            foo:13
          }
        });

      })

      .snap('three', function() {

        this.return({
          gather: function() {
            this.return(anotherSnapshot);
          },
          expect: {
            bar:'baz'
          }
        });

      })

      .snap('four', function() {

        anotherSnapshot.bar = 23;

        this.return({
          expect: {
            bar:23
          }
        });

      })
      */

      /*

      TimeAccounts.remove({});
      h_.createSharedTimeAccount();


      var azaeresId = this.createDummyUser('azaeres@gmail.com');
      var ryanbId = this.createDummyUser('ryanb@fullscreen.net');

      var azaeresTimeAccount = h_.timeAccount(azaeresId);
      var ryanbTimeAccount = h_.timeAccount(ryanbId);

      var expectation1 = {
        azaeres: {
          _id:azaeresTimeAccount._id,
          owner:azaeresId, 
          credit:azaeresTimeAccount.credit, 
          revenue:0,
          contributors:{},
          status:'active'
        },
        ryanb: {
          _id:ryanbTimeAccount._id,
          owner:ryanbId, 
          credit:ryanbTimeAccount.credit, 
          revenue:0,
          contributors:{},
          status:'active'
        }
      };

      var expectation2 = {
        azaeres: {
          _id:azaeresTimeAccount._id,
          owner:azaeresId, 
          credit:azaeresTimeAccount.credit + 10, 
          revenue:0,
          contributors:{},
          status:'active'
        },
        ryanb: {
          _id:ryanbTimeAccount._id,
          owner:ryanbId, 
          credit:ryanbTimeAccount.credit, 
          revenue:0,
          contributors:{},
          status:'active'
        }
      };
      expectation2.azaeres.contributors[azaeresTimeAccount._id] = { "amount" : 10 };


      (new SnapChain())

        .snap(function() {

          azaeresTimeAccount = h_.timeAccount(azaeresId);
          ryanbTimeAccount = h_.timeAccount(ryanbId);

          var result = {
            azaeres:azaeresTimeAccount,
            ryanb:ryanbTimeAccount
          };

          this.return(result);

        }, expectation1)


        .snap(function() {

          h_.contribute(azaeresTimeAccount._id, 10);

          this.return();

        }, expectation2)
        */


    }


  });






})();
