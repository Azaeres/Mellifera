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
  //  d_('foo');
    Meteor.call('LiabilityLimit', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Fetching liability limit...';
  },
  wipeAccount: function() {
    Meteor.call('WipeAccount', function(error, result) {
      (typeof error === 'undefined') ? d_(result) : d_(error);
    });
    return 'Wiping account...';
  }
};
h_ = Helpers;

Template.main.helpers({
  greeting: function () {
    return "Welcome to Mellifera.";
  },
  credit: function() {
    var credit = 0;

    var acctId = Session.get('timeAccountId');
    var timeAccount = TimeAccounts.findOne({_id:acctId});

    if (typeof timeAccount !== 'undefined') {
      credit = timeAccount.credit;
    }

    return credit;
  },
  debt: function() {
    var debt = 0;

    var acctId = Session.get('timeAccountId');
    var timeAccount = TimeAccounts.findOne({_id:acctId});

    if (typeof timeAccount !== 'undefined') {
      debt = timeAccount.debt;
    }

    return debt;
  },
  loggedIn: function () {
    return (Meteor.userId() !== null);
  }
});

Template.main.events({
  'click input': function() {
    d_('clicky');
    Meteor.call('ReportContribution', 7, function(error, result) {
      if (error)
        d_(error);
      if (result)
        d_(result);
    });
  }
});


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

