Meteor.startup(function() {
  if (Session.equals('currentPage', undefined)) {
    Session.set('currentPage', 'account');
  }
});

Meteor.autosubscribe(function () {
  Meteor.subscribe('TimeAccounts');
});

Meteor.autorun(function() {
  if (Meteor.userLoaded()) {
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
    $(".alert-message").delay(8000).fadeOut(3000, function () { $(this).remove(); });

    return 'Showing alert...';
  },
  isInteger: function(value) {
    if (value === parseInt(value, 10))
      return true;
    
    return false;
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
    var timeAccount = TimeAccounts.findOne({_id:acctId});

    return timeAccount;
  },
  percentDebtOfLimit: function() {
    var percent = 0, debt;

    var sharedAccount = TimeAccounts.findOne({owner:null});
    if (typeof sharedAccount !== 'undefined') {
      var limit = sharedAccount.liabilityLimit;
      var timeAccount = h_.timeAccount();

      if (typeof timeAccount !== 'undefined') {
        debt = timeAccount.debt;
        percent = (debt / limit) * 100;
      }
    }

    return percent;
  },
  applyCreditToDebt: function() {
    Meteor.call('ApplyCreditToDebt', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Applying credit...';
  },
  distributeDividends: function() {
    Meteor.call('DistributeDividends', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Distributing dividends...';
  },
  payment: function(payeeAccountId, amount) {
    Meteor.call('Payment', payeeAccountId, amount, function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Processing payment...';
  },
  queryUsersRegex: function(str) {
    var arr, newStr, s;
    s = str || '';
    s = s.replace(RegExp(' ', 'g'), '');
    arr = s.split('');
    newStr = '';
    
    _.map(arr, function(ch) {
      ch = ch + '.*';
      return newStr += ch;
    });

    return RegExp(newStr, 'i');
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

/* // Testing backbone router

var AppRouter = Backbone.Router.extend({
  routes: {
  //  "*actions": "defaultRoute", // matches http://example.com/#anything-here
    "users/:user": "user"
  },
  'user': function(user) {
    d_('user: '+user);
  }
});
// Initiate the router
var app_router = new AppRouter;

app_router.on('route:defaultRoute', function(actions) {
  d_(actions);
})

// Start Backbone history a necessary step for bookmarkable URL's
Backbone.history.start();
*/
/*
Template.main.events({
  'click input' : function () {
*//*
    var userId = Meteor.userId;
    TimeAccounts.find({owner:userId});


    var user = Meteor.user();
    var acctId = user.profile.melliferaAccountId;
    var acct = TimeAccounts.findOne({_id:acctId});
    d_(TimeAccounts.find().fetch()[0]);
     */
    /*// template data, if any, is available in 'this'
    Meteor.call('userId', function(error, result) {
      if (error)
        d_(error);
      if (result)
        d_(result);
    });*//*
  }
});
*/

