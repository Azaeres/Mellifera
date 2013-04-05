
(function() {

  var state = { 
    a:1,
    foo:'bar'
  };

  Snap('Chain name', function() {
    return state;
  }, {
      a:1,
      foo:'bar'
    })


  .next('link 1', function() {
    state.a = 2;
    state.bar = 'baz';
  }, {
      a:2,
      foo:'bar',
      bar:'baz'
    })


  .next('changing foo to baz, and a to 2', function() {
    state.a = 2;
    state.foo = 'baz'
  }, {
      a:2,
      foo:'baz',
      bar:'baz'
    });

})();
