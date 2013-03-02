Template.navigation.helpers({
  accountActive: function() {
    var currentPage = Session.get('currentPage');
    var result = (currentPage === 'account') ? ' active' : '';
    return result;
  },
  testsActive: function() {
    var currentPage = Session.get('currentPage');
    var result = (currentPage === 'tests') ? ' active' : '';
    return result;
  }
});

Template.navigation.rendered = function() {
  $('#navigation .account a').click(function(e) {
    e.preventDefault();
    AppRouter.navigate('', { trigger:true });
  });
  $('#navigation .tests a').click(function(e) {
    e.preventDefault();
    AppRouter.navigate('tests', { trigger:true });
  });
};

