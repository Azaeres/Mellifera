Template.tests.helpers({
  // accountActive: function() {
  //   var currentPage = Session.get('currentPage');
  //   var result = (currentPage === 'account') ? ' active' : '';
  //   return result;
  // },
  // testsActive: function() {
  //   var currentPage = Session.get('currentPage');
  //   var result = (currentPage === 'tests') ? ' active' : '';
  //   return result;
  // }
  tests: function() {
    return Tests.find();
  },
  test1: function() {
    var result = { describe:'Value should be a string... ', success:false, error:null };

    try {
      chai.expect('1').to.be.a('string');
      result.success = true;
    }
    catch(e) {
      // d_(e);
      result.error = e;
    }

    return result.success ? result.describe + 'Success' : result.describe + 'Failed: ' + result.error.message;
  },
  test2: function() {

  }
});

Template.tests.rendered = function() {
  // $('#navigation .account a').click(function(e) {
  //   e.preventDefault();
  //   AppRouter.navigate('', { trigger:true });
  // });
  // $('#navigation .tests a').click(function(e) {
  //   e.preventDefault();
  //   AppRouter.navigate('tests', { trigger:true });
  // });
};

