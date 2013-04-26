
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

		// Create a chain.
	  (new SnapChain())


	  .snap(function() {

	  	// This is the first link in the chain.

			// Variables attached to `this` will be accessible down the chain.
	    this.stash = 'yay';

			// Each step waits until `this.return()` is called.
			// Pass in an object that has the following optional properties:
	    this.return({

				// `gather`: A function that returns a bundle of state gathered from 
				// around the system. The state gathered can be anything; it is whatever
				// we are interested in watching.
	      gather: function() {
	        this.return(GatherState());
	      }, 

	      // `expect`: An object that looks like what you expect the gathered 
	      // state to look like.
	      expect: {
	        foo:'bar'
	      }
	    });

	  })


	  .snap(function() {

	  	// This is the second link in the chain.

	    snapshot.foo = this.stash;

			// Not passing `gather` into `this.return()` just uses the last state
			// gatherer you passed in up the chain. If you haven't passed in a gatherer
			// yet, it just uses the default gatherer, which is a simple stub that 
			// returns an empty object.

			// Not passing `expect` into  `this.return()` causes it to expect 
			// an empty object for this link in the chain.
	    this.return();

	  })

		
	
*/

	SnapChain = function(desc) {

		var _actionQueue = new ActionQueue();
		var _i = -1;
		var _desc = '';

		if (!_.isUndefined(desc)) {
			_desc = desc;
		}

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

					var snapshotClone = _.clone(snapshot);
					var expectationClone = _.clone(expectation);

					if (_desc !== '') {
						console.info('\n'+_desc);
						_desc = '';
					}

					if (_.isFunction(console.group)) {
						console.group('Snap! Link '+_mutatorContext.link);
					}
					else {
						console.error('Snap! Link '+_mutatorContext.link);
					}

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
						compare(snapshot, settings.expect);
					}
				};

				// Gather our state.
				settings.gather.call(gathererContext);
			}
		};




		this.snap = function(mutator) {

			// Adds the link's action to the queue.
			_actionQueue.addAction(function() {
				_actionQueue.wait(function() {
					_actionQueue.runNextStep();
				});

				_mutatorContext.link++;
				mutator.call(_mutatorContext);
			});

			_actionQueue.endStep();
			_actionQueue.runNextStep();

			return this;
		};

	};





	/*
	Class SnapChain
		Snap is a constraining technique. It is a lightweight form of testing that provides
		a quick, straightforward way of making sure the state of our application meets
		expectations. 

		The SnapChain class takes functions that can work asynchronously. They just need 
		to call `this.return()` when they are finished.

		Important: Always call `this.return()` when your state gatherer or mutator is done.
		If you don't, it will block the chain from running the next step.

	Instance methods:

	snap(proc, expectation)
			// Let's say that `_state` is what we're interested in constraining.
			var _state = 'foo';

			// This function's role is to gather that state, package it in an object, 
			// and return it.
			var stateGatherer = function() { this.return({ state:_state }); };

			// Mutator functions' role is to potentially modify that state.
			var mutator1 = function() { _state = 'bar'; this.return(); };
			var mutator2 = function() { _state = 'baz'; this.return(); };

			// The state gatherer is used to gather state, and that state is then 
			// compared with this `expectation` object. If what is gathered does not match
			// what is expected, the error is logged to console.
			(new SnapChain()).snap(stateGatherer, { state:'foo' })

			// This mutator is called to potentially modify that state, then the state 
			// gatherer is internally called again to generate a new snapshot. That state 
			// snapshot is then compared with this `expectation` object. If the snapshot 
			// does not meet our expectation, the error is logged to console.
				.snap(mutator1, { state:'bar' })

			// Every other call does the same as above.
				.snap(mutator2, { state:'baz' });

			// The above example wouldn't log any errors, so our chain is said to have 
			// "constrained" this series of state transactions.

			// If, on the other hand, it logged an error at some point, then it means that 
			// at that point our state did not meet what we were expecting, and this 
			// indicates a problem.

	startGroup
		A convenience method for wrapping the subsequent console output in a group.
	endGroup
		A convenience method for ending the console group.
	state
		This is designed to provide the state of the chain in a way that can be 
		easily constrained by snap itself.

	*//*
	SnapChain = function() {
		var _actionQueue = new ActionQueue();

		// Every link in the chain has a unique index.
		var _i = 0;

		var _stateGatherer;
		var _snaps = [];

		this.snap = function(proc, expectation) {

			var index = _i;

			var first = (index === 0);
			if (first) {
				
				// If this is the first link in the chain, we interpret the `proc` as 
				// a "state gatherer", a function that gathers state.

				_stateGatherer = proc;
			}

			// The `that` object is the context that the state gatherer and 
			// all mutators are called in.
			// It bundles in the link's index, the expectation object, and a return 
			// method that should be called whenever the state gatherer or mutator
			// is finished doing its thing.
			var that = {
				linkIndex: _i,
				expectation: expectation,
				return: function(snapshot) {

					// Dumps a snapshot and its expectation to the console.
					var log = function(snapshot, expectation) {
						var snapshotClone = _.clone(snapshot);
						var expectationClone = _.clone(expectation);

						if (_.isFunction(console.group)) {
							console.group('Snap! Link '+index);
						}
						else {
							console.error('Snap! Link '+index);
						}

						console.error('   Found: ', snapshotClone, '\n Expected: ', expectationClone);

						if (_.isFunction(console.groupEnd)) {
							console.groupEnd();
						}

						_snaps.push(index);
					};

					// Compares a snapshot with what is currently expected.
					var compare = function(snapshot) {
						if (!_.isEqual(snapshot, expectation)) {
							// Logs an error if the snapshot isn't what we expected.
							log(snapshot, expectation);
						}

						// After running the comparison, we should stop waiting and run the next step.
						_actionQueue.complete();
					};


					// If this is the first link, the return should have a snapshot.
					// If it doesn't we'll just use an empty snapshot object.
					if (first && _.isUndefined(snapshot)) {
						snapshot = {};
					}

					if (_.isUndefined(snapshot)) {
						// If a snapshot wasn't provided, we'll need to get one.
						_stateGatherer.call(that);
					}
					else {
						// If the snapshot was provided, run a comparison.
						compare(snapshot);
					}
				}
			};

			// Adds the link's action to the queue.
			_actionQueue.addAction(function() {
				_actionQueue.wait(function() {
					_actionQueue.runNextStep();
				});

				proc.call(that);
			});

			_actionQueue.endStep();
			_actionQueue.runNextStep();

			_i++;
			return this;
		};

		this.startGroup = function(groupName) {
			if (_.isFunction(console.group)) {
				if (_.isUndefined(groupName)) {
					groupName = '';
				}

				console.group(groupName);
			}
			else {
				console.error(groupName);
			}

			return this;
		};

		this.endGroup = function() {
			if (_.isFunction(console.groupEnd)) {
				console.groupEnd();
			}
			return this;
		};

		this.state = function() {
			return {
				snaps: _snaps.length
			};
		};
	};
*/
})();

