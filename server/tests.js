(function() {



  _.extend(Helpers, {

    wipeSlate: function() {
      TimeAccounts.remove({});
      h_.createSharedTimeAccount();
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
            userCount: 2,
            timeAccountCount: 3
          }
        });

      })

      .snap('Self contribution', function() {

        h_.contribute(this.accounts[0]._id, 1000);

        var emails = this.emails;

        this.return({
          gather: function() {

            var account = h_.findTimeAccountByEmail(emails[0])

            this.return({
              credit: account.credit,
              debt: h_.getTotalOutstandingContributionAmount(account._id)
            });
          },
          expect: {
            credit: 20,
            debt: 20
          }
        });
      })


      .snap('Other contributions', function() {


        h_.contribute(this.accounts[1]._id, 500);
        h_.contribute(this.accounts[2]._id, 300);
        h_.contribute(this.accounts[3]._id, 100);

        // var emails = this.emails;

        // this.return({
        //   gather: function() {

        //     var account = h_.findTimeAccountByEmail(emails[0])

        //     this.return({
        //       credit: account.credit,
        //       debt: h_.getTotalOutstandingContributionAmount(account._id)
        //     });
        //   },
        //   expect: {
        //     credit: 20,
        //     debt: 20
        //   }
        // });

        this.return();
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
