(function() {

  Template.account.helpers({
    liabilityLimit: function() {
      return h_.liabilityLimit();
    },
    credit: function() {
      var credit = 0;
      var account = h_.timeAccount();

      if (!_.isUndefined(account)) {
        var lockedCredit = h_.totalOutstandingContributionAmount(account._id, true);
        credit = account.credit - lockedCredit;
        if (credit < 0)
          credit = 0;
        d_('credit:', credit, account.credit, lockedCredit);
      }

      return h_.hoursFromCents(credit);
    },
    lockedCredit: function() {
      var lockedCredit = 0;
      var account = h_.timeAccount();

      if (!_.isUndefined(account)) {
        lockedCredit = h_.totalOutstandingContributionAmount(account._id, true);
      }

      return h_.hoursFromCents(lockedCredit);
    },
    debt: function() {
      // d_('Getting debt...');

      var debt;
  
      var timeAccount = h_.timeAccount();

      if (typeof timeAccount !== 'undefined') {
        debt = h_.totalOutstandingContributionAmount(timeAccount._id);
      }

      return h_.hoursFromCents(debt);
    }
  });

  var warning = 'success';
    
  var updateProgressBar = function() {
    var setProgressBarClass = function(percent) {
      var debtWarning = function(p) {
        var w = 'success';

        if (p >= 70)
          w = 'warning'

        if (p >= 90)
          w = 'danger'

        return w;
      };

      var $progressBar = $('.progress .bar').width(percent+'%');
      var newWarning = debtWarning(percent);

      if (newWarning !== warning) {
        // Warning changed.
        var oldc = 'bar-'+warning;
        warning = newWarning;
        var newc = 'bar-'+warning;

        $('.progress .bar').removeClass(oldc).addClass(newc);
      }
    };

  // Hover tooltip.
    var percent = h_.percentDebtOfLimit();
    var debtPercent = (Math.round(percent * 100) / 100).toFixed(1);

    setProgressBarClass(percent);

    $('#account .progress').hover(function() {
      $('#account .progress').tooltip('destroy').tooltip({
        trigger: 'manual',
        placement:'top',
        title:'Debt: ' + debtPercent + '%',
        placement:'left'
      }).tooltip('show');
    },
    function() {
      $('#account .progress').tooltip('hide');
    });
  };

  Meteor.autorun(updateProgressBar);

  Template.account.rendered = function() {

    updateProgressBar();

    $('#reportContributionModal').on('shown', function () {
      $('#reportContributionModal .contribution-amount-input').select();
    });

    $('#paymentModal').on('shown', function () {
      $('#paymentModal .payee-input').select();
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
    'keypress #reportContributionModal .contribution-amount-input': function(event) {
      if (event.which === 13) {
        $(event.target).blur();
        $('#reportContributionModal .contribution-submit').click();
      }
    },
    'click #reportContributionModal .contribution-amount-input': function(event) {
      $(event.target).select();
    },
    'click #reportContributionModal .contribution-submit': function(event) {
      var btn = $(event.target);
      var email = $('#reportContributionModal .contribute-to-input').val();
      var hours = parseFloat($('#reportContributionModal .contribution-amount-input').val());
      var cents = h_.centsFromHours(hours);

      if (!isNaN(cents)) {
        Meteor.call('ReportContribution', email, cents, function(error, result) {
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
    'click #paymentModal .payee-input': function(event) {
      $(event.target).select();
    },
    'keypress #paymentModal .payment-amount-input': function(event) {
      if (event.which === 13) {
        $(event.target).blur();
        $('#paymentModal .payment-submit').click();
      }
    },
    'click #paymentModal .payment-amount-input': function(event) {
      $(event.target).select();
    },
    'click #paymentModal .payment-submit': function(event) {
      var email = $('#paymentModal .payee-input').val();
      var hours = parseFloat($('#paymentModal .payment-amount-input').val());
      var cents = h_.centsFromHours(hours);
      
      Meteor.call('MakePayment', email, cents, function(error, result) {
        if (error) {
          h_.showAlert('error', '<strong>Error ' + error.error + ':</strong> ' + error.reason);
          if (typeof error.details !== 'undefined')
            d_(error.details);
        }
        else {
          hours = h_.hoursFromCents(cents);
          var hoursTxt = (hours === 1) ? ' hour' : ' hours';
          if (result) {
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

})();



