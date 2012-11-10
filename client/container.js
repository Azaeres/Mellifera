Template.container.helpers({
  loggedIn: function () {
    return (Meteor.userId() !== null);
  },
  accountDetailsPage: function() {
    var currentPage = Session.get('currentPage');
    return (currentPage === 'account') ? true : false;
  },
  barterPage: function() {
    var currentPage = Session.get('currentPage');
    return (currentPage === 'barter') ? true : false;
  }
});

