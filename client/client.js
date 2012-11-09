var d_ = function(str) {
  if (typeof console !== 'undefined')
    console.log(str);
};

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

TimeAccounts = new Meteor.Collection('TimeAccounts');

Helpers = {
  liabilityLimit: function() {
    var sharedAcct = TimeAccounts.findOne({owner:null});
    var liabilityLimit = null;
    if (typeof sharedAcct !== 'undefined') {
      liabilityLimit = sharedAcct.liabilityLimit;
    }

    return liabilityLimit;
  },
  wipeAccount: function() {
    Meteor.call('WipeAccount', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Wiping account...';
  },
  showAlert: function(type, message) {
    $("#alert-area").append('<div class="alert alert-message alert-' + type + ' fade in" data-alert> <button type="button" class="close" data-dismiss="alert">×</button> <p> ' + message + ' </p> </div>');
    $(".alert-message").delay(6000).fadeOut("slow", function () { $(this).remove(); });

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
  boostSharedCredit: function() {
    Meteor.call('BoostSharedCredit', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Boosting shared credit...';
  },
  payment: function(payeeAccountId, amount) {
    Meteor.call('Payment', payeeAccountId, amount, function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Processing payment...';
  }
};
h_ = Helpers;

Template.main.helpers({
  liabilityLimit: function() {
    return h_.liabilityLimit();
  },
  credit: function() {
    var credit;
    var timeAccount = h_.timeAccount();

    if (typeof timeAccount !== 'undefined') {
      credit = timeAccount.credit;
    }

    return h_.hoursFromCents(credit);
  },
  debt: function() {
    var debt;
    var timeAccount = h_.timeAccount();

    if (typeof timeAccount !== 'undefined') {
      debt = timeAccount.debt;
    }

    return h_.hoursFromCents(debt);
  },
  loggedIn: function () {
    return (Meteor.userId() !== null);
  },
  percentDebtOfLimit: function() {
    return h_.percentDebtOfLimit();
  },
  debtWarning: function() {
    var warning = 'success', percent = 0, debt;

    var sharedAccount = TimeAccounts.findOne({owner:null});
    if (typeof sharedAccount !== 'undefined') {
      var limit = sharedAccount.liabilityLimit;
      var timeAccount = h_.timeAccount();

      if (typeof timeAccount !== 'undefined') {
        debt = timeAccount.debt;
        percent = (debt / limit) * 100;

        if (percent >= 70)
          warning = 'warning'

        if (percent >= 90)
          warning = 'danger'
      }
    }

    return warning;
  }
});


Template.main.rendered = function() {
  $('.debt-amount .progress').hover(function() {
    $('.debt-amount .progress').tooltip({
      trigger: 'manual',
      placement:'top',
      title:'Debt: ' + h_.roundCurrency(h_.percentDebtOfLimit()) + '%',
      placement:'left'
        }).tooltip('show');
  },
  function() {
    $('.debt-amount .progress').tooltip('hide');
  });
};

Template.main.events({
  'click #report-cont-button': function(event) {
    var btn = $(event.target);
    var hours = parseFloat($('#report-cont-input').val());
    var cents = h_.centsFromHours(hours);

    if (!isNaN(cents)) {
      Meteor.call('ReportContribution', cents, function(error, result) {
        if (error) {
          h_.showAlert('error', '<strong>Error ' + error.error + ':</strong> ' + error.reason);
          if (typeof error.details !== 'undefined')
            d_(error.details);
        }
        else {
          var hours = h_.hoursFromCents(result);
          var hoursTxt = (hours === 1) ? ' hour' : ' hours';
          if (result) {
            h_.showAlert('success', 'A contribution of <strong>' + hours + hoursTxt +'</strong> has been applied to your account.');
          }
          else {
            h_.showAlert('block', 'A contribution of <strong>' + hours + hoursTxt + '</strong> has been applied to your account.');
          }
        }
      });
    }
    else {
      h_.showAlert('block', 'A contribution of <strong>0 hours</strong> has been applied to your account.');
    }
  },
  'keypress #report-cont-input': function(event) {
    if (event.which === 13) {
      $(event.target).blur();
      $('#report-cont-button').click();
    }
  },
  'click #report-cont-input': function(event) {
    $(event.target).select();
  }
});

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

