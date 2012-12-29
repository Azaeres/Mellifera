Template.navigation.helpers({
  accountActive: function() {
    var currentPage = Session.get('currentPage');
    var result = (currentPage === 'account') ? ' active' : '';
    return result;
  },
  barterActive: function() {
    var currentPage = Session.get('currentPage');
    var result = (currentPage === 'barter') ? ' active' : '';
    return result;
  }
});

Template.navigation.rendered = function() {
  $('#navigation .home a').click(function(e) {
    e.preventDefault();
    Session.set('currentPage', 'account');
  });
  $('#navigation .barter a').click(function(e) {
    e.preventDefault();
    Session.set('currentPage', 'barter');
  });
};

