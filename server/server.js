Accounts.config({
	sendVerificationEmail:true,
	forbidClientAccountCreation:false
});

MelliferaAccounts = new Meteor.Collection('MelliferaAccounts');

Meteor.startup(function () {
});

Meteor.methods({
	userId: function() {
		return Meteor.user();
	},
	melliferaAccount: function() {
		var acctId = Meteor.user().profile.melliferaAccountId;
		return MelliferaAccounts.findOne({_id:acctId});
	}
});

Accounts.onCreateUser(function(options, user) {
	// Create a new MelliferaAccount document for this user.
	var acctId = MelliferaAccounts.insert({credit:0, debt:0, dividends:0});

	// We still want the default hook's 'profile' behavior.
	var profile = options.profile;
  if (!profile) 
  	profile = {};
  profile.melliferaAccountId = acctId;
  user.profile = profile;

  return user;
});
