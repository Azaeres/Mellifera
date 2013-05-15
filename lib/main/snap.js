
(function() {





	var ActionQueue = function() {
		
		_seq = [];
		_cur = [];
		var _cb = function() {};
		var _complete = true;
		var _waiting = false;

		// Adds an action to the currect step.
		this.addAction = function(func, args) {

			if (_.isFunction(func)) {
				_cur.push({ func:func, args:args });
			}
			else
				throw '`addAction`: Argument 1 must be a function.';

			return this;
		};

		// A step is a sequence of actions.
		// `endStep` pushes all the actions that have been added so far into the 
		// next step.
		this.endStep = function() {
			_seq.push(_cur);
			_cur = [];

			return this;
		};

		// Runs through all the actions in a step.
		// Actions are called on an internal delegate object.
		// When a step is done, it's removed from the queue.
		this.runNextStep = function() {

			if (!_waiting) {
				var step = _seq[0];

				if (!_.isUndefined(step)) {
					_seq.splice(0, 1);

					_(step).each(function(action) {
						if (_.isArray(action.args)) {
							action.func.apply(action.args);
						}
						else {
							action.func();
						}
					});

					if (!_waiting) {
						_cb();
					}
				}
			}

			return this;
		};

		// Sets a callback function to call when the queue stops waiting.
		this.onComplete = function(callback) {
			if (_.isFunction(callback))
				_cb = callback;

			return this;
		};

		// If you've called `wait`, this tells the action queue to stop waiting
		// and call the callback (if one was given at the call to `wait`).
		this.complete = function() {
			if (_waiting) {
				_waiting = false;
				_cb();
			}

			return this;
		};

		// Tells the action queue to wait.
		// While waiting, all calls to `runNextStep` do nothing.
		// Give it a callback function to execute when it should stop waiting.
		// Will wait until `complete` is called.
		this.wait = function(callback) {
			this.onComplete(callback);
			_waiting = true;

			return this;
		};

		// For debug purposes.
		// Returns the currect action sequence, so it can be inspected.
		this.state = function() {
			return {
				'Steps': _seq,
				'Current step': _cur,
				'Callback': _cb,
				'Waiting': _waiting,
				'Complete': _complete
			};
		};

	};














/*	
	Snap.js
	=======

	Snap is a constraining technique. It is a lightweight form of testing that provides
	a straightforward way of making sure the state of our application meets
	our expectations every step of the way.


	How to use
	----------

		// Create a chain. The chain name is optional.
	  (new SnapChain('An optional name for this chain'))


		// Add a link to the chain by calling `snap()`.
	  .snap(function() {

	  	// The function that's passed into `snap()` is called a "mutator", because 
	  	// its role is to potentially mutate application state.

			// Variables attached to `this` are accessible down the chain.
			// The only properties that are reserved by the snap chain are `return`, 
			// `link`, and `name`. Overwriting these reserved properties may 
			// cause the snap chain to not behave properly.
	    this.stash = 'yay';

			// Each link waits until `this.return()` is called. This can be called 
			// in an asyncronous callback, in order to 
			// Pass in an object that has the following optional properties:
	    this.return({

				// `gather`: A function that returns a bundle of state gathered from 
				// around the system. The state gathered can be anything; it is whatever
				// we are interested in watching. Call `this.return()` when done 
				// gathering, and pass in the gathered state snapshot.

				// The gather function is not intended to change application state; its
				// role is simply to gather it.
	      gather: function() {
	      	var snapshot = GatherState();
	        this.return(snapshot);
	      }, 

	      // `expect`: An object that looks like what you expect the gathered 
	      // state to look like. If you pass in an empty object, or nothing, 
	      // the link will not run a comparison, causing it to be silent for this 
	      // link.
	      expect: {
	        foo:'bar'
	      }
	    });

	  })

	  .snap('An optional short description', function() {

	  	// This is the second link in the chain.

			// The `this` object is the same object for each link mutator in the chain,
			// so variables you set into it will still be accessible down the chain.
	    snapshot.foo = this.stash;

			// Not passing a `gather` function into `this.return()` just uses the 
			// last state gatherer you passed into the chain. If you haven't passed 
			// in a gatherer yet, it just uses the default gatherer, which is a 
			// simple stub that returns an empty object.

			// Passing an empty object into `this.return()` is effectively the 
			// same as passing no arguments.

	    this.return();

	  })

		
	
*/

	SnapChain = function(name) {

		var _actionQueue = new ActionQueue();
		var _i = -1;
		var _desc = '';

		if (!_.isUndefined(name)) {
			_desc = name;
		}

		// The default state gatherer is an empty stub.
		var _stateGatherer = function() {
			this.return();
		};

		var _mutatorContext = {
			// Every link in the chain has a unique index.
			link: _i,
	
			return: function(options) {

				if (_.isUndefined(options)) {
					options = {};
				}

				if (!_.isUndefined(options.gather)) {
					_stateGatherer = options.gather;
				}

				var settings = _.extend({
					gather: _stateGatherer,
					expect: {}
				}, options);



				// Dumps a snapshot and its expectation to the console.
				var log = function(snapshot, expectation) {

					// We'll clone the input here so that we see what they looked like
					// at the time they were logged to console, instead of being a live 
					// reference to the object.
					var snapshotClone = _.clone(snapshot);
					var expectationClone = _.clone(expectation);

					// Show the description, if we have provided one.
					if (_desc !== '') {
						console.info('\n'+_desc);

						// We'll only bother to show the description once.
						_desc = '';
					}

					// This is where we show the link index.
					// Show groups in the console if possible.
					var nameStr = '';

					if (_mutatorContext.name !== '') {
						nameStr = ' - "' + _mutatorContext.name + '"';
					}

					var str = 'Snap! Link ' + _mutatorContext.link + nameStr;
					if (_.isFunction(console.group)) {
						console.group(str);
					}
					else {
						console.error(str);
					}

					// Present what we found right next to what we expected, so 
					// the developer can see the difference.
					console.error('   Found: ', snapshotClone, '\n Expected: ', expectationClone);

					if (_.isFunction(console.groupEnd)) {
						console.groupEnd();
					}
				};


				// Compares a snapshot with what is currently expected.
				var compare = function(snapshot, expectation) {
					if (!_.isEqual(snapshot, expectation)) {
						// Logs an error if the snapshot isn't what we expected.
						log(snapshot, expectation);
					}

					// After running the comparison, we should stop waiting and run the next step.
					_actionQueue.complete();
				};


				var gathererContext = {
					return: function(snapshot) {
						// When the gatherer provides a snapshot, run a comparison.
						if (!_.isEmpty(settings.expect)) {
							compare(snapshot, settings.expect);
						}
						else {
							// Stop waiting and run the next step.
							_actionQueue.complete();
						}
					}
				};

				// Gather our state.
				settings.gather.call(gathererContext);
			}
		};




		this.snap = function() {

			var name = '';
			var mutator = function() {
				this.return();
			};

			if (_.isFunction(arguments[0])) {
				mutator = arguments[0];
			}
			else if (_.isString(arguments[0]) && _.isFunction(arguments[1])) {
				name = arguments[0];
				mutator = arguments[1];
			}

			// Adds the link's action to the queue.
			_actionQueue.addAction(function() {

				// Every step waits.
				_actionQueue.wait(function() {

					// After waiting, run the next step.
					_actionQueue.runNextStep();
				});

				// Increment the link count and call the mutator.
				_mutatorContext.link++;
				_mutatorContext.name = name;
				mutator.call(_mutatorContext);
			});

			// After we load the first action into the queue, run it.
			_actionQueue.endStep();
			_actionQueue.runNextStep();

			// Snap is chainable.
			return this;
		};

	};




})();

