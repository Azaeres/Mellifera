Meteor.startup(function () {
  // code to run on server at startup
  Accounts.forbidClientAccountCreation = true;
  Accounts.sendVerificationEmail = true;
});
