var should = require('should'),
    Cluster = require('../lib/cluster').Cluster;

describe('Tests for creating a core-os cluster', function() {
  describe('default options', function() {
    it('should work with no options', function() {
      var cluster = new Cluster();
 
      cluster.type.should.equal('performance');
      cluster.release.should.equal('stable');
      should.not.exist(cluster.keyname);
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

  describe('cluster.release', function() {
    it('should not allow a custom cluster release', function() {
      (function() {
        new Cluster({ release: 'foo' });
      }).should.throw();
    });

    it('should allow a null release', function() {
      var cluster = new Cluster({ release: null });

      cluster.release.should.equal('stable');
    });

    it('should allow a stable release', function() {
      var cluster = new Cluster({ release: 'stable' });

      cluster.release.should.equal('stable');
    });

    it('should allow a beta release', function() {
      var cluster = new Cluster({ release: 'beta' });

      cluster.release.should.equal('beta');
    });

    it('should allow a alpha release', function() {
      var cluster = new Cluster({ release: 'alpha' });

      cluster.release.should.equal('alpha');
    });
  });
});