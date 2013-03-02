if (_DEVELOPMENT_) {

/*
        d_('Server is supposed to have entered testing mode');

        d_(error);
        h_.enterTestingMode();

        var jasmineEnv = jasmine.getEnv();
        jasmineEnv.updateInterval = 1000;

        var htmlReporter = new jasmine.HtmlReporter();

        jasmineEnv.addReporter(htmlReporter);

        jasmineEnv.specFilter = function(spec) {
          return htmlReporter.specFilter(spec);
        };

        // var currentWindowOnload = window.onload;

        // window.onload = function() {
        //   if (currentWindowOnload) {
        //     currentWindowOnload();
        //   }
        //   execJasmine();
        // };

        // function execJasmine() {
          // jasmineEnv.execute();
        // }

        jasmineEnv.execute();

        // Meteor.call('ExitTestingMode', function(error, result) {
        //   h_.exitTestingMode();
        //   d_('Testing complete');
        //   d_(error);
        // });
*/

	// Specs

	describe('Test environment', function() {
		var value, result, error, sharedAccount;

		it('only the shared time account should exist after setup', function() {
			runs(function() {
				value = 0;

				h_.setupTestEnvironment(function(e, r) {
		    	result = r;
		    	error = e;
		    });
			});

			waitsFor(function() {
				value++;
				return result;
			}, "The value should be incremented", 750);

			runs(function() {
				d_(result);

				var count = TimeAccounts.find().count();
				expect(count).toBe(1);

				sharedAccount = h_.sharedAccount();
				expect(sharedAccount).toBeDefined();
				d_(sharedAccount);

			});
		});

		describe('Shared time account', function() {
			it('credit should be 0 on shared account creation', function() {
				runs(function() {
					expect(sharedAccount.credit).toBe(0);
				});
			});

			it('debt should be 0 on shared account creation', function() {
				runs(function() {
					expect(sharedAccount.debt).toBe(0);
				});
			});

			it('liability limit should be defined', function() {
				runs(function() {
					expect(sharedAccount.liabilityLimit).toBeDefined();
				});
			});

			it('owner should be null', function() {
				runs(function() {
					expect(sharedAccount.owner).toBeNull();
				});
			});

			it('status should be "active"', function() {
				runs(function() {
					expect(sharedAccount.status).toBe('active');
				});
			});

			it('client cannot write to the shared account directly', function() {
				runs(function() {
					TimeAccounts.update({ _id:sharedAccount._id }, { $set:{ credit:1000 } }, function(e) {
						expect(e.error).toBe(403);
					});
				});
			});
		});
	});
/*
	describe('Contribution test suite', function() {
		var value, result, error;

		runs(function() {
			value = 0;

			h_.testContribution(function(e, r) {
	    	result = r;
	    	error = e;
	    });
		});

		waitsFor(function() {
			value++;
			return result;
		}, "The value should be incremented", 750);


		it('should return results', function() {
			runs(function() {
				d_(result);
				expect(result).toBeDefined();
			});
		});

		it('should not throw an exception when activating an invalid id', function() {
			runs(function() {
				expect(result.activateInvalidIdError).not.toBeDefined();
			});
		});

		it('should not throw an exception when freezing an invalid id', function() {
			runs(function() {
				expect(result.freezeInvalidIdError).not.toBeDefined();
			});
		});

		it('should throw an exception when contributing to an invalid id', function() {
			runs(function() {
				expect(result.contributeInvalidIdError).toBeDefined();
			});
		});

		it('should throw an exception when contributing a negative amount', function() {
			runs(function() {
				expect(result.contributeNegativeAmountError).toBeDefined();
			});
		});

		describe('Account creation snapshot', function() {
			it('results should contain snapshot', function() {
				runs(function() {
					expect(result.contributorAfterCreation).toBeDefined();
				});
			});

			it('credit should be 0 on account creation', function() {
				runs(function() {
					expect(result.contributorAfterCreation.credit).toBe(0);
				});
			});

			it('debt should be 0 on account creation', function() {
				runs(function() {
					expect(result.contributorAfterCreation.debt).toBe(0);
				});
			});

			it('status should be "frozen" on account creation', function() {
				runs(function() {
					expect(result.contributorAfterCreation.status).toBe('frozen');
				});
			});

			it('liability limit should not be defined', function() {
				runs(function() {
					expect(result.contributorAfterCreation.liabilityLimit).not.toBeDefined();
				});
			});

			it('owner should be set correctly', function() {
				runs(function() {
					expect(result.contributorAfterCreation.owner).toBe(result.testUserId);
				});
			});

			it('client cannot write to their own account directly', function() {
				runs(function() {
					TimeAccounts.update({ _id:result.contributorAfterCreation._id }, { $inc:{ credit:1000 } }, function(e) {
						expect(e.error).toBe(403);
					});
				});
			});
		});

		describe('Failed contribution snapshot', function() {
			it('results should contain snapshot', function() {
				runs(function() {
					expect(result.contributorAfterFailedContribution).toBeDefined();
				});
			});

			it('credit should still be 0', function() {
				runs(function() {
					expect(result.contributorAfterFailedContribution.credit).toBe(0);
				});
			});

			it('debt should still be 0', function() {
				runs(function() {
					expect(result.contributorAfterFailedContribution.debt).toBe(0);
				});
			});

			it('status should still be "frozen"', function() {
				runs(function() {
					expect(result.contributorAfterFailedContribution.status).toBe('frozen');
				});
			});

			it('owner should still be set correctly', function() {
				runs(function() {
					expect(result.contributorAfterFailedContribution.owner).toBe(result.testUserId);
				});
			});
		});

		describe('After activation snapshot', function() {
			it('results should contain snapshot', function() {
				runs(function() {
					expect(result.contributorAfterActivation).toBeDefined();
				});
			});

			it('credit should still be 0 after activation', function() {
				runs(function() {
					expect(result.contributorAfterActivation.credit).toBe(0);
				});
			});

			it('debt should still be 0 after activation', function() {
				runs(function() {
					expect(result.contributorAfterActivation.debt).toBe(0);
				});
			});

			it('status should now be "active" after activation', function() {
				runs(function() {
					expect(result.contributorAfterActivation.status).toBe('active');
				});
			});

			it('owner should still be set correctly', function() {
				runs(function() {
					expect(result.contributorAfterActivation.owner).toBe(result.testUserId);
				});
			});
		});

		describe('Successful contribution snapshot', function() {
			it('results should contain snapshot', function() {
				runs(function() {
					expect(result.contributorAfterSuccessfulContribution).toBeDefined();
				});
			});

			it('credit should now be the contribution amount after contribution', function() {
				runs(function() {
					expect(result.contributorAfterSuccessfulContribution.credit).toBe(result.contributionAmount);
				});
			});

			it('debt should now be the contribution amount after contribution', function() {
				runs(function() {
					expect(result.contributorAfterSuccessfulContribution.debt).toBe(result.contributionAmount);
				});
			});

			it('status should still be "active" after contribution', function() {
				runs(function() {
					expect(result.contributorAfterSuccessfulContribution.status).toBe('active');
				});
			});

			it('owner should still be set correctly', function() {
				runs(function() {
					expect(result.contributorAfterSuccessfulContribution.owner).toBe(result.testUserId);
				});
			});
		});

		describe('Contribution to max snapshot', function() {
			it('results should contain snapshot', function() {
				runs(function() {
					expect(result.contributorAfterContributionToMax).toBeDefined();
				});
			});

			it('credit should now be capped to the liability limit', function() {
				runs(function() {
					expect(result.contributorAfterContributionToMax.credit).toBe(result.liabilityLimit);
				});
			});

			it('debt should now be capped to the liability limit', function() {
				runs(function() {
					expect(result.contributorAfterContributionToMax.debt).toBe(result.liabilityLimit);
				});
			});

			it('status should still be "active" after contribution', function() {
				runs(function() {
					expect(result.contributorAfterContributionToMax.status).toBe('active');
				});
			});

			it('owner should still be set correctly', function() {
				runs(function() {
					expect(result.contributorAfterContributionToMax.owner).toBe(result.testUserId);
				});
			});
		});

		describe('Freeze snapshot', function() {
			it('results should contain snapshot', function() {
				runs(function() {
					expect(result.contributorAfterFreeze).toBeDefined();
				});
			});

			it('credit should still be the liability limit', function() {
				runs(function() {
					expect(result.contributorAfterFreeze.credit).toBe(result.liabilityLimit);
				});
			});

			it('debt should still be the liability limit', function() {
				runs(function() {
					expect(result.contributorAfterFreeze.debt).toBe(result.liabilityLimit);
				});
			});

			it('status should now be "frozen" after freeze', function() {
				runs(function() {
					expect(result.contributorAfterFreeze.status).toBe('frozen');
				});
			});

			it('owner should still be set correctly', function() {
				runs(function() {
					expect(result.contributorAfterFreeze.owner).toBe(result.testUserId);
				});
			});
		});

	});
*/



	/*
	var userId = Meteor.userId();
	if (userId !== null) {
		describe('Specs', function() {
			var value, flag;

			it('should support asyncronous calls', function() {
				runs(function() {
					flag = false;
					value = 0;

					setTimeout(function() {
						flag = true;
					}, 500);
				});

				waitsFor(function() {
					value++;
					return flag;
				}, "The value should be incremented", 750);

				runs(function() {
					expect(value).toBeGreaterThan(0);
				});
			});
		});

		var timeAccountId;
		describe('Server', function() {
			var value, result, error;

			it('should respond to method calls', function() {
				runs(function() {
					value = 0;

			    Meteor.call('UserTimeAccountId', function(e, r) {
			    	result = r;
			    	error = e;
			    });
				});

				waitsFor(function() {
					value++;
					return result;
				}, "The value should be incremented", 750);

				runs(function() {
					timeAccountId = result;
					expect(result).not.toBe(null);
				});
			});
		});

		describe('Money supply', function() {
			var value, result, error;

			beforeEach(function() {
				runs(function() {
					value = 0;

			    Meteor.call('UniversalBalance', function(e, r) {
			    	result = r;
			    	error = e;
			    });
				});

				waitsFor(function() {
					value++;
					return result;
				}, "The value should be incremented", 750);
			});

			it('the sum of all credit should be equal to the sum of all debt', function() {
				runs(function() {
					expect(result.credit).toEqual(result.debt);
				});
			});
		});

		describe('The user\'s time account', function() {
			var value, result, error, timeAccount, timeAccountId;

			beforeEach(function() {
				runs(function() {
					value = 0;

			    Meteor.call('UserTimeAccountId', function(e, r) {
			    	result = r;
			    	error = e;
			    });
				});

				waitsFor(function() {
					value++;
					timeAccountId = result;
			    timeAccount = TimeAccounts.findOne({ _id:timeAccountId });
					return result;
				}, "The value should be incremented", 750);
			});

			it('should exist', function() {
				runs(function() {
					expect(timeAccount).not.toBe(null);
				});
			});

			it('its owner should be the logged in user', function() {
				runs(function() {
					var owner = timeAccount.owner;
					var userId = Meteor.userId();

					expect(owner).toEqual(userId);
				});
			});

			it('its record of credit and debt should be integers', function() {
				runs(function() {
					var credit = timeAccount.credit;
					var debt = timeAccount.debt;
					var isInt;

					isInt = h_.isInteger(credit);
					expect(isInt).toBeTruthy();

					isInt = h_.isInteger(debt);
					expect(isInt).toBeTruthy();
				});
			});
		});
	}
	*/



}



