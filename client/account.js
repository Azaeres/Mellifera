
(function() {
  var debtWarning = function(p) {
    var w = 'success';

    if (p >= 70)
      w = 'warning'

    if (p >= 90)
      w = 'danger'

    return w;
  };

  var warning = 'success';
  Meteor.autorun(function() {
    var percent = h_.percentDebtOfLimit();
    var $progressBar = $('.progress .bar').width(percent+'%');

    var newWarning = debtWarning(percent);
    if (newWarning !== warning) {
      // Warning changed.
      var oldc = 'bar-'+warning;
      warning = newWarning;
      var newc = 'bar-'+warning;

      $('.progress .bar').removeClass(oldc).addClass(newc);
    }
  });
})();

Template.account.helpers({
  liabilityLimit: function() {
    return h_.liabilityLimit();
  },
  credit: function() {
    var credit;
    var timeAccount = h_.timeAccount();

    if (typeof timeAccount !== 'undefined') {
      credit = timeAccount.credit;
    }

    return h_.hoursFromCents(credit);
  },
  debt: function() {
    var debt;
    var timeAccount = h_.timeAccount();

    if (typeof timeAccount !== 'undefined') {
      debt = timeAccount.debt;
    }

    return h_.hoursFromCents(debt);
  },
  percentDebtOfLimit: function() {
    return h_.percentDebtOfLimit();
  }
});


// Localization
// 
Template.account.helpers({
  accountBalanceStr: function() {
    return l_('Account Balance');
  },
  creditStr: function() {
    return l_('Credit');
  },
  debtStr: function() {
    return l_('Debt');
  },
  reportContributionStr: function() {
    return l_('Report Contribution');
  },
  hoursStr: function() {
    return l_('hours');
  },
  submitStr: function() {
    return l_('Submit');
  },
  makePaymentStr: function() {
    return l_('Make Payment');
  },
  payeeEmailStr: function() {
    return l_('Payee');
  }
})

Template.account.rendered = function() {
  // Hover tooltip.
  $('#account .progress').hover(function() {
    $('#account .progress').tooltip({
      trigger: 'manual',
      placement:'top',
      title:'Debt: ' + h_.roundCurrency(h_.percentDebtOfLimit()) + '%',
      placement:'left'
        }).tooltip('show');
  },
  function() {
    $('#account .progress').tooltip('hide');
  });
  

  $('#reportContributionModal').on('shown', function () {
    $('#account .contribution-amount-input').select();
  });

  $('#paymentModal').on('shown', function () {
    $('#account .payee-input').select();
  });

  $('.typeahead').typeahead({
    source: function (query, process) {
      Meteor.call('QueryUsers', query, function(error, result) {
        if (typeof error === 'undefined') {
          var arr = [];
          _.each(result, function(user) {
            _.each(user.emails, function(email) {
              arr.push(email.address);
            });
          });
          process(arr);
        }
        else {
          d_(error);
        }
      });
    },
    matcher: function(item) {
      return true;
    }
  });
};

Template.account.events({
  'keypress #account .contribution-amount-input': function(event) {
    if (event.which === 13) {
      $(event.target).blur();
      $('#account .contribution-submit').click();
    }
  },
  'click #account .contribution-amount-input': function(event) {
    $(event.target).select();
  },
  'click #account .contribution-submit': function(event) {
    var btn = $(event.target);
    var hours = parseFloat($('#account .contribution-amount-input').val());
    var cents = h_.centsFromHours(hours);

    if (!isNaN(cents)) {
      Meteor.call('ReportContribution', cents, function(error, result) {
        if (error) {
          h_.showAlert('error', '<strong>Error ' + error.error + ':</strong> ' + error.reason);
          if (typeof error.details !== 'undefined')
            d_(error.details);
        }
        else {
          hours = h_.hoursFromCents(result);
          var hoursTxt = (hours === 1) ? ' hour' : ' hours';
          if (result) {
            h_.showAlert('success', 'A contribution of <strong>' + hours + hoursTxt +'</strong> has been applied to your account.');
          }
          else {
            h_.showAlert('block', 'A contribution of <strong>' + hours + hoursTxt + '</strong> has been applied to your account.');
          }
        }
      });
    }
    else {
      h_.showAlert('block', 'A contribution of <strong>0.00 hours</strong> has been applied to your account.');
    }

    $('#reportContributionModal').modal('hide');
  },
  'click #account .payee-input': function(event) {
    $(event.target).select();
  },
  'keypress #account .payment-amount-input': function(event) {
    if (event.which === 13) {
      $(event.target).blur();
      $('#account .payment-submit').click();
    }
  },
  'click #account .payment-amount-input': function(event) {
    $(event.target).select();
  },
  'click #account .payment-submit': function(event) {
    var email = $('#account .payee-input').val();
    var hours = parseFloat($('#account .payment-amount-input').val());
    var cents = h_.centsFromHours(hours);
    
    Meteor.call('Payment', email, cents, function(error, result) {
      //(typeof error === 'undefined') ? d_(result) : d_(error);
      if (error) {
        h_.showAlert('error', '<strong>Error ' + error.error + ':</strong> ' + error.reason);
        if (typeof error.details !== 'undefined')
          d_(error.details);
      }
      else {
        hours = h_.hoursFromCents(cents);
        var hoursTxt = (hours === 1) ? ' hour' : ' hours';
        if (result.success) {
          h_.showAlert('success', 'Payment of <strong>' + hours + hoursTxt +'</strong> completed.');
        }
        else {
          h_.showAlert('error', 'Payment of <strong>' + hours + hoursTxt + '</strong> failed. ' + result.details);
        }
      }
    });

    $('#paymentModal').modal('hide');
  }
});

