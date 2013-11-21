v0.1.3

## About

Mellifera is a working proof-of-concept for a time exchange resilient to wealth distribution problems. It encourages active cooperation, knowledge-sharing, and helps stabilize prices, safeguarding against uncontrolled deflation. This exchange trades in an hour-based local currency. This project is experimental and is undergoing active development.

Mellifera gets its name from the [western honey bee](https://en.wikipedia.org/wiki/Western_honey_bee).

## Explanation-Driven Development

Since problems persist because of the lack of sufficient explanatory knowledge, this project seeks good explanation as its primary means of solving and preventing problems.

See the [wiki](https://github.com/ryancbarry/Mellifera/wiki) for more information.

## Getting started

* How to start a development server (a production-ready, local community server is planned, but currently not supported):
	1. Download and install Meteor `curl https://install.meteor.com | /bin/sh`. For more information on deploying a Meteor app, see the [Meteor documentation](http://docs.meteor.com).
	2. Clone the repo `git clone git@github.com:ryancbarry/Mellifera.git`.
	3. Run `meteor run --settings development.json` from within the project directory.
	4. Visit `http://localhost:3000` with a web browser.

* How to registering a user account (the first user created is automatically given the 'admin' role):
	1. Create the account.
		1. Logout (unless already logged out).
		2. Click the "Sign in" link, then enter your email address and password.
		3. Click the "Create account" link, then click the "Create account" button.
	2. Logged in with the 'admin' account, run `Helpers.activateTimeAccount([email address])` in the JavaScript console, replacing [email address] with the email of the registered account to activate.

* How to freeze an account (keeping it from affecting the economy, and keeping the economy from affecting it):
	1. Logged in with the 'admin' account, run `Helpers.freezeTimeAccount([email address])` in the JavaScript console, replacing [email address] with the email of the account to freeze.
 
* How to report a contribution of time:
	1. Click the "Account" tab to navigate to the Account page.
	2. Click the "Report Contribution" button.
	3. On the Report Contribution form, enter the email address of the time account you wish to contribute to, or leave it blank to contribute to your own account.
	4. On the Report Contribution form, enter the amount of time worked (in hours).
	5. Click the "Submit" button.

* How to pay someone:
	1. Click the "Account" tab to navigate to the Account page.
	2. Click the "Make Payment" button.
	3. On the "Make Payment" form, enter the email address of the time account you want to pay.
	4. Enter the amount of the payment (in hours).
	5. Click the "Submit" button.

## Roadmap

Working proof-of-concept:

* 0.1.4 Improving security, using Meteor match, and closing known loopholes.
* 0.1.5 Terms of use, make sure users cannot register an account without agreeing to the terms.
* 0.1.6 Root account method to seize a given time account.
* 0.1.7 Root account method to change the system-wide liability limit.
* 0.1.8 Mellifera logo.
* 0.2.0 User guide and developer documentation.
* **0.2.0 Production-ready deployment to Meteor.**
* 0.2.1 Refactor, organize codebase. Ensure that latest conventions are being followed everywhere.

Ideas for the future:

* Instead of presenting the word "debt" to the user, present "available credit", which is = liabilityLimit - currentDebt. 0 if debt-locked, liability limit if no debt on account.
* Redesigned, responsive front end ready for mobile.
* Quickpay with QR codes (Mellifera Paypoint).
* Refunds.
* Confirm payment readout with contributors it will compensate and surplus it will generate.
* Contribution memo field.
* Usage testing.
* Notification system.
* Gravatar support.
* User profiles.
* Advanced user search.

With upcoming Meteor features:

* Logging (SQL).
* Analytics (SQL).
* String localization (l18n).
* Test specs (Testing framework).
* Public API (REST endpoints).

## License

Mellifera is licensed under a [Creative Commons Attribution-ShareAlike 3.0 Unported license](http://creativecommons.org/licenses/by-sa/3.0/).

![Creative Commons License](http://i.creativecommons.org/l/by-sa/3.0/88x31.png "Creative Commons License")


