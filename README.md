## About

Mellifera is a working proof-of-concept for a time exchange resilient to wealth distribution problems. It encourages active cooperation, knowledge-sharing, and helps stabilize prices, safeguarding against uncontrolled deflation. This exchange trades in an hour-based local currency. This project is experimental and is undergoing active development.

Mellifera gets its name from the [western honey bee](https://en.wikipedia.org/wiki/Western_honey_bee).

## Explanation-Driven Development

Since problems persist because of the lack of sufficient explanatory knowledge, this project seeks good explanation as its primary means of solving and preventing problems.

See the [wiki](https://github.com/ryancbarry/Mellifera/wiki) for more information.

## Getting started

* How to start a development server (a production-ready, local community server is currently not supported):
	1. Download and install Meteor `curl https://install.meteor.com | /bin/sh`. For more information on deploying a Meteor app, see the [Meteor documentation](http://docs.meteor.com).
	2. Clone the repo `git clone git@github.com:ryancbarry/Mellifera.git`.
	3. Run `meteor run --settings development.json` from within the project directory.
	4. Visit `http://localhost:3000` with a web browser.


* Registering a user
	1. Logout (unless already logged out).
	2. Click the "Sign in" link, then enter your email address and password.
	3. Click the "Create account" link, then click the "Create account" button.
	4. Run `Helpers.activateTimeAccount()` in the JavaScript console.

 
* How to report a contribution of time
	1. Click the "Account" tab to navigate to the Account page.
	2. Click the "Report Contribution" button.
	3. On the Report Contribution form, enter the amount of time worked.
	4. Click the "Submit" button.


* How to pay someone
	1. Click the "Account" tab to navigate to the Account page.
	2. Click the "Make Payment" button.
	3. On the "Make Payment" form, enter the email address of the user you want to pay.
	4. Enter the amount of the payment (in hours).
	5. Click the "Submit" button.

## Roadmap

Working proof-of-concept:

* 0.0.6 Update documentation, readme, code comments
* 0.0.7 Refactor, organize codebase
* 0.0.8 Root account method to activate a given time account
* 0.0.9 Root account method to freeze a given time account
* 0.0.10 Improving security, using Meteor match, and closing known loopholes
* 0.0.11 Terms of use, make sure users cannot register an account without agreeing to the terms
* 0.0.12 Root account method to seize a given time account
* 0.0.13 Root account method to change the system-wide liability limit
* 0.0.14 Mellifera logo
* 0.0.15 User guide and developer documentation
* **0.1.0 Deployment to Meteor**

Ideas for the future:

* Usage testing
* Refunds
* Contribution memo field
* Notifications
* Gravatar support
* Quickpay with QR codes (Mellifera Paypoint)
* Confirm payment readout with contributors it will compensate and surplus it will generate
* Redesigned front end
* User profiles
* Advanced user search

With upcoming Meteor features:

* Logging (SQL)
* Analytics (SQL)
* String localization (l18n)
* Test specs (Testing framework)
* Public API (REST endpoints)

## License

Mellifera is licensed under a [Creative Commons Attribution-ShareAlike 3.0 Unported license](http://creativecommons.org/licenses/by-sa/3.0/).

![Creative Commons License](http://i.creativecommons.org/l/by-sa/3.0/88x31.png "Creative Commons License")


