Meteor.startup(function() {
  if (Session.equals('currentPage', undefined)) {
    Session.set('currentPage', 'account');
  }

  // Routes
  var Router = Backbone.Router.extend({
    routes: {
      '': 'account',
      'account': 'account',
      'tests': 'tests',
    },
    'account': function() {
      Session.set('currentPage', 'account');
    },
    'tests': function() {
      Session.set('currentPage', 'tests');
    }
  });

  // Initiate the router
  AppRouter = new Router;

  // Start Backbone history a necessary step for bookmarkable URL's
  Backbone.history.start({ pushState: true });
});

Meteor.autosubscribe(function () {
  Meteor.subscribe('TimeAccounts');
});

Meteor.autorun(function() {
  if (Meteor.userId()) {
    Meteor.call('UserTimeAccountId', function(error, result) {
      if (typeof result !== 'undefined') {
        Session.set('timeAccountId', result);
      }
      if (typeof error === 'object') {
        d_(error);
      }
    });
  }
});

_.extend(Helpers, {
  showAlert: function(type, message) {
    $("#notifications .alert-area").append('<div class="alert alert-message alert-' + type + ' fade in" data-alert> <button type="button" class="close" data-dismiss="alert">×</button> <p> ' + message + ' </p> </div>');
    $(".alert-message").delay(7000).fadeOut(2000, function () { $(this).remove(); });

    return 'Showing alert...';
  },
  roundCurrency: function(amount) {
    return (Math.round(amount * 100) / 100).toFixed(2);
  },
  hoursFromCents: function(cents) {
    var hours = cents / 100;
    
    return this.roundCurrency(hours);
  },
  centsFromHours: function(hours) {
    hours = this.roundCurrency(hours);
    var amount = hours * 100;
    
    return Math.round(amount);
  },
  timeAccount: function() {
    var acctId = Session.get('timeAccountId');
    var timeAccount = TimeAccounts.findOne({ _id:acctId });

    return timeAccount;
  },
  percentDebtOfLimit: function() {
    var percent = 0, debt;

    var sharedAccount = h_.sharedAccount();
    if (typeof sharedAccount !== 'undefined') {
      var limit = sharedAccount.liabilityLimit;
      var timeAccount = h_.timeAccount();

      if (typeof timeAccount !== 'undefined') {
        debt = timeAccount.debt;
        percent = (debt / limit) * 100;
      }
    }

    return percent;
  }
});

// Localization
// English string generators
// 
_.extend(Helpers, {
  debtDecreaseStr: function(cents) {
    return h_.debtDecreaseStrEN(cents);
  },
  debtIncreaseStr: function(cents) {
    return h_.debtIncreaseStrEN(cents);
  },
  creditIncreaseStr: function(cents) {
    return h_.creditIncreaseStrEN(cents);
  },
  debtDecreaseStrEN: function(cents) {
    var hours = h_.hoursFromCents(cents);
    var hoursTxt = (hours === 1) ? ' hour' : ' hours';
    return 'Your debt has decreased by <strong>' + hours + hoursTxt + '</strong>.';
  },
  debtIncreaseStrEN: function(cents) {
    var hours = h_.hoursFromCents(cents);
    var hoursTxt = (hours === 1) ? ' hour' : ' hours';
    return 'Your debt has increased by <strong>' + hours + hoursTxt + '</strong>.';
  },
  creditIncreaseStrEN: function(cents) {
    var hours = h_.hoursFromCents(cents);
    var hoursTxt = (hours === 1) ? ' hour' : ' hours';
    return 'Your credit has increased by <strong>' + hours + hoursTxt + '</strong>.';
  }
});

// Watches for changes to the time account, and notifies the logged-in user.
// 
(function() {
  var credit, debt;

  Meteor.autorun(function() {
    var timeAccount = h_.timeAccount();
    if (typeof timeAccount !== 'undefined') {
      if (typeof debt === 'undefined') {
        debt = timeAccount.debt;
      }
      else {
        var diff = debt - timeAccount.debt;
        if (diff > 0) {
          h_.showAlert('success', h_.debtDecreaseStr(diff));
        }
        else if (diff < 0) {
          h_.showAlert('warning', h_.debtIncreaseStr(Math.abs(diff)));
        }

        debt = timeAccount.debt;
      }

      if (typeof credit === 'undefined') {
        credit = timeAccount.credit;
      }
      else {
        var diff = credit - timeAccount.credit;
        if (diff < 0) {
          h_.showAlert('success', h_.creditIncreaseStr(Math.abs(diff)));
        }

        credit = timeAccount.credit;
      }
    }
  });

})();
