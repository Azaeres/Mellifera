(function() {

  Template.contributors.helpers({
  	contributors: function() {
  		// var accountId = Session.get('timeAccountId');
  		var account = h_.timeAccount();

  		if (!_.isUndefined(account)) {
	  		d_('account')
	  		d_(account)

	  		// var email = h_.findEmailByTimeAccountId(accountId);
	  		// d_(email);

	  		return _.keys(account.contributors);
  		}
  	}
  });

})();