About
=====

Mellifera is a working proof-of-concept for a time exchange resilient to wealth distribution problems. It encourages active cooperation, knowledge-sharing, and safeguards against uncontrolled deflation. This exchange trades in hour-based local currency. This project is experimental and is undergoing active development.

Roadmap
-------

v0.5.0

* [Group contributions/payment](https://github.com/ryancbarry/Mellifera/wiki/Group-contribution-payment-proposal)
* Implement specs for payments and surplus distribution
* Improved testing on/off switch
* Refunds and direct debt payment
* User activity logging
* Improved notifications
* User guide / API documentation

v0.6.0

* Devel branch
* Quickpay with QR codes
* Advanced user search
* User profiles
* Global/individual stats/charts
* String localization
* Gravatar support

Theory
------

1. An explanation of money and wealth.
2. Contribution, the start of the Monetary Cycle.
3. Payment and compensation, the end of the Monetary Cycle.
4. The case for shared occupational knowledge and shared surplus.

Time-trading rules
------------------

1. Members may have only one account.
2. Only the owner of an account has say on where its credit is spent.
3. Do not over-report your hours; be honest when accounting for time worked.
4. Do not waste others' time; share knowledge of best practices.
5. Do not waste your own time; use best practices whenever possible, and seek guidance when you need it.
6. Do not hoard money indefinitely; spend it regularly.

Rule 1 ensures that everyone gets the same amount of dividends and liability limit. Rule 2  Rules 3-6 help stabilize the money supply. Failing to abide by these rules causes the community currency to lose its usefulness, and should be grounds for the termination of membership.

Getting started
===============

* How to start a local time-trading community server:
	1. Download and install Meteor `curl https://install.meteor.com | /bin/sh`. For more information on deploying a Meteor app, see the [Meteor documentation](http://docs.meteor.com).
	2. Clone the repo `git clone git@github.com:ryancbarry/Mellifera.git`.
	3. Run `meteor` from within the project directory.
	4. Visit `http://localhost:3000` with a web browser.

* Running tests
 

* How to report a contribution of time
* How to pay someone

System structure
================

Database
--------

The database contains a collection of TimeAccounts, and a collection of Meteor users. A TimeAccount collection with two accounts looks like this:

		{ "owner" : null, "credit" : 1, "debt" : 0, "status" : "active", "liabilityLimit" : 16000, "_id" : "2ad95dc6-cea6-4530-8e09-0f9a6b4c226a" }
		{ "owner" : "32d7a2a6-d882-4e7a-8cfc-ed89f14771b7", "credit" : 3538, "debt" : 9000, "status" : "active", "_id" : "90dbb849-c59f-4672-8368-735830c98f41" }
		{ "owner" : "bc0bc13b-aafb-44db-84ce-fcee5348b74f", "credit" : 15001, "debt" : 9540, "status" : "active", "_id" : "8090ba81-1a98-4e21-8458-c1796ab692b1" }

In this example, the first account is the shared time account. It is created if there isn't one, and there can be only one. Structurally, it differs from normal time accounts by having a `liabilityLimit` property (all members' debt limit), and by having a null owner. It is responsible for keeping track of shared credit/debt.

The rest of the time accounts are normal, personal accounts, and they are associated with a Meteor user through the `owner` property. A user can have only one time account, and it is responsible for keeping track of that user's personal credit/debt. 

A time account can have "frozen" or "active" status. They are "frozen" when first created, so users can register without impacting the pool of currency. A "frozen" account's credit/debt cannot change, so it can not be contributed to, nor can it make payments, nor can it receive payments of any kind. An "active" time account, in contrast, can do all these things.

Credit/debt is stored as an integer to keep track of every cent, so this may lead to some complexity when dividing amounts. The proposed method of handling this employs a remainder pile of credit/debt, to be stored up until it can be split evenly.

Server
------

The server is designed to do only work that the client cannot be trusted to do. There are two main parts to the server: private methods and public methods. The public methods typically just take a private method and expose it as an AJAX response.

The most significant server methods are `contribute` (contributes an amount to a time account), `distributeDividends` (gives everyone an even share of the shared credit), `payment` (takes credit from a payer's time account, and applies it to a payee's time account), and `applyCreditToDebt` (applys a credit to a time account's debt, returning any excess credit).

Client
------

There are roughly three parts to the client: template partials, template JS, and CSS. Much of the user interface comes from Twitter Bootstrap so it can look decent without much effort. Much of the development focus is on the logic of the time exchange itself.


Testing
-------

Specs are implemented using Jasmine, a client-side testing library. They typically make requests of the server to perform operations and then analyze the state snapshots that are returned. During testing, the server makes use of a separate collection of test time accounts in order to have control over their state without changing the state of the primary time accounts.

License
=======

Mellifera is free software released under the [MIT License](https://github.com/ryancbarry/Mellifera/blob/master/LICENSE.md).


