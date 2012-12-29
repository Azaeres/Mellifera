Template.container.helpers({
  loggedIn: function () {
    return (Meteor.userId() !== null);
  },
  accountDetailsPage: function() {
    var currentPage = Session.get('currentPage');
    return (currentPage === 'account');
  },
  barterPage: function() {
    var currentPage = Session.get('currentPage');
    return (currentPage === 'barter');
  },
  testsPage: function() {
    var currentPage = Session.get('currentPage');
    return (currentPage === 'tests');
  }
});

