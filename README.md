About
=====

Mellifera is a working proof-of-concept for a time exchange resilient to wealth distribution problems. It encourages active cooperation, knowledge-sharing, and safeguards against uncontrolled deflation. This exchange trades in an hour-based local currency. This project is experimental and is undergoing active development.

Mellifera gets its name from the [western honey bee](https://en.wikipedia.org/wiki/Western_honey_bee), *Apis Mellifera*.

## Roadmap

Working proof-of-concept:

* 0.6 Update documentation, readme, code comments
* 0.7 Separate devel branch, refactor, organize codebase
* 0.8 Root account method to activate a given time account
* 0.9 Root account method to freeze a given time account
* 0.10 Improving security, using Meteor match, and closing known loopholes
* 1.0 Deployment to Meteor and usage testing

* 1.1 Root account method to seize a given time account
* 1.2 Root account method to change the system-wide liability limit
* 1.3 Mellifera logo
* 1.4 Refunds
* 1.5 Terms of use
* 1.6 User guide and developer documentation

Community:

* Notifications
* Gravatar support
* Confirm payment readout with contributors it will compensate and surplus it will generate
* Quickpay with QR codes
* User profiles
* Advanced user search

With upcoming Meteor features:

* Logging (SQL)
* Analytics (SQL)
* String localization (l18n)
* Test specs (Testing framework)


Getting started
===============

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

Explanation
===========

Mellifera focuses on Explanation-Driven Development (EDD). Since problems persist due to our collective ignorance, this project seeks to prevent them by providing good explanations of how it works. You can expect the documentation to continually improve, and the source code to be well-covered by instructive comments.

## Money and wealth

For the purposes of this project, wealth is the quantity and quality of available options. Wealth distribution is a problem solved by an economy, one best developed by systems engineers with the interests of all in mind. For this reason, the source and methodology behind this project is open to all.

Mellifera is an exchange that trades in hours, a currency that is widely accessible, yet scarce enough to store value. This money is purposely not backed by a commodity like gold in order to avoid systemically enriching the holders of that commodity. However, like any market, trust in others is necessarily integral to its success.

This exchange treats money primarily as a record of debt. This means that every cent of credit is backed by a cent of debt somewhere in the system.

## The monetary cycle

Money is created when someone reports a contribution of time, and it is destroyed when debt is compensated. This project refers to this as the monetary cycle. Money reaches its peak utility when it can be flushed out of the system just as easily as it is introduced. A vibrant exchange helps to distribute wealth.

This project inherits some limitations from being based in debt. There are natural limits to liability. At some point, people's faith in a currency, or in others' ability to pay them back will be shaken. Mellifera makes an attempt to limit the damage by establishing a common liability limit. This is an amount of debt that everyone cannot exceed.

## Wealth distribution

Revenue is naturally uneven. Some earn little, some earn a lot. Those that earn more have been able to convince others to pay them. This can be due to factors like trust or some kind of occupational knowledge, but it always comes down to persuasion.

It is preferable to spend our resources creating more and better options for all instead of using it to undermine someone else's ability to do the same. Although competition can motivate us to work hard, it ultimately wastes more time than collaboration. Solving problems is its own reward, and open source methodologies have shown us the ineffecacy of rivalry.

Shared knowledge of best practices is essential to wealth distribution. It is our first line of defense against economic problems. However, if we fail to share knowledge, or if sharing knowledge fails to even out the availability of more and better options, Mellifera attempts to compensate through a policy of sharing surplus revenue.

Surplus, according to Mellifera, is an amount of revenue that exceeds one's outstanding debt. Sharing surplus revenue means that one can only earn money for time contributed. Not only does it help recirculate credit so it can find debt to compensate, it can even help defang monopolies - as long as they're reporting their time honestly.

Member rules
============

For whatever weaknesses are inherit in a system such as this, Mellifera tries hard to bring our attention to them. If we collectively fail to follow these rules, we erode the market's utility. When we depend on this system to distribute wealth amongst us, breaking the following rules poisons the well we are all drinking from. Since we are all co-dependent, hurting any of us hurts all of us. Every problem is everyone's problem, regardless of how we prioritize the effort to solve them.

1. Members may have only one account.
2. Only the owner of an account has say on where its credit is spent.
3. Do not over-report your hours; be honest when accounting for time worked.
4. Do not waste others' time; share knowledge of best practices.
5. Do not waste your own time; use best practices whenever possible, and seek guidance when you need it.
6. Do not hoard money indefinitely; spend it regularly.
7. Do not exploit security holes or bugs.

Rule 1 ensures that everyone gets the same amount of dividends and liability limit. Rule 2 helps stabilize the currency's value. Rules 3-6 help stabilize the money supply. Failure to abide by these rules should be grounds for the termination of membership.

System structure
================

## Database

The database contains a collection of TimeAccounts, and a collection of Meteor users. A TimeAccount collection with two accounts looks like this:

		{ "owner" : null, "credit" : 1, "debt" : 0, "status" : "active", "liabilityLimit" : 16000, "_id" : "2ad95dc6-cea6-4530-8e09-0f9a6b4c226a" }
		{ "owner" : "32d7a2a6-d882-4e7a-8cfc-ed89f14771b7", "credit" : 3538, "debt" : 9000, "status" : "active", "_id" : "90dbb849-c59f-4672-8368-735830c98f41" }
		{ "owner" : "bc0bc13b-aafb-44db-84ce-fcee5348b74f", "credit" : 15001, "debt" : 9540, "status" : "active", "_id" : "8090ba81-1a98-4e21-8458-c1796ab692b1" }

In this example, the first account is the shared time account. It is created if there isn't one, and there can be only one. Structurally, it differs from normal time accounts by having a `liabilityLimit` property (all members' debt limit), and by having a null owner. It is responsible for keeping track of shared credit/debt.

The rest of the time accounts are normal, personal accounts, and they are associated with a Meteor user through the `owner` property. A user can have only one time account, and it is responsible for keeping track of that user's personal credit/debt. 

A time account can have "frozen" or "active" status. They are "frozen" when first created, so users can register without affecting the pool of currency. A "frozen" account's credit/debt cannot change, so it can not be contributed to, nor can it make payments, nor can it receive payments of any kind. An "active" time account, in contrast, can do all these things.

Credit/debt is stored as an integer to keep track of every cent, so this may lead to some complexity when dividing amounts. The proposed method of handling this employs a remainder pile of credit/debt, to be stored up until it can be split evenly.

## Server

The server is designed to do only work that the client cannot be trusted to do. There are two main parts to the server: private methods and public methods. The public methods typically just take a private method and expose it as an AJAX response.

The most significant server methods are `contribute` (contributes an amount to a time account), `distributeDividends` (gives everyone an even share of the shared credit), `payment` (takes credit from a payer's time account, and applies it to a payee's time account), and `applyCreditToDebt` (applys a credit to a time account's debt, returning any excess credit).

## Client

There are roughly three parts to the client: template partials, template JS, and CSS. Much of the user interface comes from Twitter Bootstrap so it can look decent without much effort. Much of the development focus is on the logic of the time exchange itself.

## Testing

Tests will be implemented when Meteor releases a testing framework.

License
=======

Mellifera is licensed under a [Creative Commons Attribution-ShareAlike 3.0 Unported license](http://creativecommons.org/licenses/by-sa/3.0/).

![Creative Commons License](http://i.creativecommons.org/l/by-sa/3.0/88x31.png "Creative Commons License")


