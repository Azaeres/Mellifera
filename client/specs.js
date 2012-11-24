
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


//--- CODE --------------------------
var foo = 'bar';

//--- SPECS -------------------------
describe("foo", function() {
  it("has a value of bar", function() {
    expect(foo).toBe('bar');
  });
});

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

/*
		it('the universal money supply should be within the universal liability limit', function() {
			runs(function() {
				var within = (result.credit <= result.liabilityLimit);
				expect(within).toBeTruthy();
			});
		});*/
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





