var Conf = v.lib('Conf');
var Argv = v.lib('providers', 'Argv');
var Env  = v.lib('providers', 'Env');

describe('Conf', function () {
  var instance;

  beforeEach(function () {
    instance = new Conf();
  });

  describe('add store', function () {
    it('should instantiate the correct provider', function () {
      instance.addStore({
        provider: 'argv'
      });

      v.assert.equal(instance.stores[0] instanceof Argv, true);
    });

    it('should add the provider in the correct location', function () {
      instance.addStore({
        provider: 'argv'
      });

      instance.addStore({
        provider: 'env'
      }, 10);

      v.assert.equal(instance.stores[0] instanceof Argv, true);
    });
  });

  describe('replace store', function () {
    beforeEach(function () {
      instance.addStore({
        provider: 'env'
      });

      instance.addStore({
        provider: 'env'
      });
    });

    it('should replace the provider in the correct location', function () {
      instance.replaceStore({
        provider: 'argv'
      }, -1);

      v.assert.equal(instance.stores[1] instanceof Argv, true);
    });

    it('should replace the provider in the correct location', function () {
      instance.replaceStore({
        provider: 'argv'
      }, 0);

      v.assert.equal(instance.stores[0] instanceof Argv, true);
    });

    it('should not replace the provider when an invalid position is given', function () {
      instance.replaceStore({
        provider: 'argv'
      }, 'abc');

      v.assert.equal(instance.stores[1] instanceof Env, true);
    });

    it('should not replace the provider when an invalid position is given', function () {
      instance.replaceStore({
        provider: 'argv'
      }, 99);

      v.assert.equal(instance.stores[1] instanceof Env, true);
    });
  });

  describe('lookupValue', function () {
    var data;

    beforeEach(function () {
      data = {
        name: {
          first: {
            'first-letter': 's'
          }
        },

        seth: {
          address: {
            city: 'palo alto'
          },
          friends: [{ name: 'steven' }]
        }
      };
    });

    it('should locate name.first.first-letter', function () {
      var value = instance.lookupValue('name.first.first-letter', data);
      v.assert.equal(value, 's');
    });

    it('should locate seth.address', function () {
      var value = instance.lookupValue('seth.address', data);
      var expectedValue = {
        city: 'palo alto'
      };

      v.assert.deepEqual(value, expectedValue);
    });

    it('should return undefined for seth.phone', function () {
      var value = instance.lookupValue('seth.phone', data);
      var expectedValue = undefined;

      v.assert.deepEqual(value, expectedValue);
    });

    it('should return undefined for seth.address.city.zipcode', function () {
      var value = instance.lookupValue('seth.address.city.zipcode', data);
      var expectedValue = undefined;

      v.assert.deepEqual(value, expectedValue);
    });

    it('should locate seth.friends.0.name', function () {
      var value = instance.lookupValue('seth.friends.0.name', data);
      var expectedValue = 'steven';

      v.assert.deepEqual(value, expectedValue);
    });

    it('should return undefined if key is not a string', function () {
      var value = instance.lookupValue({}, data);
      var expectedValue = undefined;

      v.assert.deepEqual(value, expectedValue);
    });
  });

  describe('get', function () {
    beforeEach(function () {
      instance = new Conf();

      process.argv = ['node', 'test', '--tester.name', 'seth', '--tester.age', '155'];

      instance.addStore({
        provider: 'argv'
      });

      instance.addStore({
        provider: 'file',
        cwd: v.path('fixtures', 'a', 'b', 'c'),
        filename: 'config.js'
      });

      instance.addStore({
        provider: 'literal',
        data: {
          tester: {
            name: 'ray'
          }
        }
      });
    });

    it('should return name from the literal store', function () {
      var value = instance.get('tester.name');
      var expectedValue = 'ray';

      v.assert.equal(value, expectedValue);
    });

    it('should return age from the argv store', function () {
      var value = instance.get('tester.age');
      var expectedValue = '155';

      v.assert.equal(value, expectedValue);
    });

    it('should return location from the file store', function () {
      var value = instance.get('tester.location');
      var expectedValue = 'palo alto';

      v.assert.equal(value, expectedValue);
    });

  });
});
