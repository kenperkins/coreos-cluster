var should = require('should'),
    Cluster = require('../lib/cluster').Cluster;

describe('Tests for creating a core-os cluster', function() {
  describe('default options', function() {
    it('should work with no options', function() {
      var cluster = new Cluster();

      cluster.size.should.equal(3);
      cluster.type.should.equal('performance');
      cluster.version.should.equal('stable');
      should.not.exist(cluster.keyname);
    });
  });

  describe('cluster.size', function() {
    it('should not allow a cluster smaller than 3', function() {
      (function() {
        new Cluster({ size: 2 })
      }).should.throw();
    });

    it('should not allow a 0 sized cluster', function() {
      (function() {
        new Cluster({ size: 0 })
      }).should.throw();
    });

    it('should not allow a negative sized cluster', function() {
      (function() {
        new Cluster({ size: -1 })
      }).should.throw();
    });

    it('should not allow a string value for cluster size', function() {
      (function() {
        new Cluster({ size: 'hello' })
      }).should.throw();
    });

    it('should move floats to ints', function() {
      var cluster;

      (function() {
        cluster = new Cluster({ size: 3.3 })
      }).should.not.throw();

      cluster.size.should.equal(3);
    });

    it('should not allow a object value for cluster size', function() {
      (function() {
        new Cluster({ size: {} })
      }).should.throw();
    });

    it('should not allow an array value for cluster size', function() {
      (function() {
        new Cluster({ size: [] })
      }).should.throw();
    });

    it('should not allow an empty value for cluster size', function() {
      (function() {
        new Cluster({ size: null })
      }).should.throw();
    });

    it('should allow a cluster size greater than 3', function() {
      var cluster = new Cluster({ size: 5 });

      cluster.size.should.equal(5);
    });
  });

  describe('cluster.type', function() {
    it('should not allow a custom cluster type', function() {
      (function() {
        new Cluster({ type: 'foo' });
      }).should.throw();
    });

    it('should allow a null type', function() {
      var cluster = new Cluster({ type: null });

      cluster.type.should.equal('performance');
    });

    it('should allow a performance type', function() {
      var cluster = new Cluster({ type: 'performance' });

      cluster.type.should.equal('performance');
    });

    it('should allow a onMetal type', function() {
      var cluster = new Cluster({ type: 'onMetal' });

      cluster.type.should.equal('onMetal');
    });
  });

  describe('cluster.version', function() {
    it('should not allow a custom cluster version', function() {
      (function() {
        new Cluster({ version: 'foo' });
      }).should.throw();
    });

    it('should allow a null version', function() {
      var cluster = new Cluster({ version: null });

      cluster.version.should.equal('stable');
    });

    it('should allow a stable version', function() {
      var cluster = new Cluster({ version: 'stable' });

      cluster.version.should.equal('stable');
    });

    it('should allow a beta version', function() {
      var cluster = new Cluster({ version: 'beta' });

      cluster.version.should.equal('beta');
    });

    it('should allow a alpha version', function() {
      var cluster = new Cluster({ version: 'alpha' });

      cluster.version.should.equal('alpha');
    });
  });
});