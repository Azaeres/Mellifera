
(function() {

	var _gatherer;
	var _chain = '';
	var _link = '';

	var _emptyChainable = {
		next: function() {
			return this;
		}
	};

	var _compare = function(expected, linkIndex) {
		var snapshot = _gatherer();
		var stateMatches = _.isEqual(snapshot, expected);

		if (!stateMatches) {
			console.error(_chain+'{');
			if (_link !== '')
				console.error('  '+_link+':');
			console.error('    '+linkIndex+': Snap!', snapshot);
			console.error('    Expected', expected);
			console.error('}');

			return _emptyChainable;
		}

		return {
			next: Snap,
			linkIndex: ++linkIndex
		};
	};

	var _firstRun = function(gatherer, expected) {
		_gatherer = gatherer;
		return _compare(expected, 0);
	};

	var _subsequentRuns = function(proc, expected, linkIndex) {
		proc();
		return _compare(expected, linkIndex);
	};

	Snap = function(describe, func, expected) {

		var funcArg = '';
		var objArg = '';

		var linkIndex = this.linkIndex;
		_link = '';

		if (_.isUndefined(linkIndex)) {
			linkIndex = 0;
		}

		if (_.isString(describe)) {
			if (linkIndex === 0) {
				_chain = describe+' ';
			}
			else {
				_link = describe;
			}
		}
		else {
			expected = func;
			func = describe;
			funcArg = '1 ';
			objArg = '2 ';
		}

		var result;
		if (_.isFunction(func)) {
			if (_.isObject(expected)) {

				if (linkIndex === 0) {
					result = _firstRun(func, expected);
				}
				else {
					result = _subsequentRuns(func, expected, linkIndex)
				}
			}
			else
				throw _linkIndex+': Argument '+objArg+'must be an object.';
		}
		else
			throw _linkIndex+': Argument '+funcArg+'must be a function.';

		return result;
	};

})();

