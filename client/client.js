var d_ = function(str) {
  if (typeof console !== 'undefined')
    console.log(str);
};

TimeAccounts = new Meteor.Collection('TimeAccounts');

Template.main.helpers({
  greeting: function () {
    return "Welcome to Mellifera.";
  },
  credit: function() {
    var acctId = Session.get('timeAccountId');

    var credit = 0;
    var timeAccount = TimeAccounts.findOne({_id:acctId});
    if (typeof timeAccount !== 'undefined') {
      credit = timeAccount.credit;
    }

    return credit;
  },
  loggedIn: function () {
    return (Meteor.userId() !== null);
  }
});

Meteor.autosubscribe(function () {
  Meteor.subscribe('TimeAccounts');
});

Meteor.autorun(function() {
  if (Meteor.userLoaded()) {
    Meteor.call('GetUserTimeAccountId', function(error, result) {
      if (typeof result !== 'undefined') {
        Session.set('timeAccountId', result);
      }
      if (typeof error === 'object') {
        d_(error);
      }
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

