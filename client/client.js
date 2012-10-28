var d_ = function(str) {
  if (typeof console !== 'undefined')
    console.log(str);
};

Template.main.greeting = function () {
  return "Welcome to Mellifera.";
};

Template.main.events({
  'click input' : function () {
    // template data, if any, is available in 'this'
    Meteor.call('melliferaAccount', function(error, result) {
      if (error)
        d_(error);
      if (result)
        d_(result);
    });
  }
});

Template.main.loggedIn = function () {
  return (Meteor.userId() !== null);
};
