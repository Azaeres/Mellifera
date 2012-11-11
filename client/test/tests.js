
//--- CODE --------------------------
var foo = 'bar';

//--- SPECS -------------------------
describe("foo", function() {
  it("has a value of bar", function() {
    expect(foo).toBe('bar');
  });
});
