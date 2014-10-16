## coreos-cluster [![Build Status](https://secure.travis-ci.org/kenperkins/coreos-cluster.png?branch=master)](http://travis-ci.org/kenperkins/coreos-cluster) [![NPM version](https://badge.fury.io/js/coreos-cluster.png)](http://badge.fury.io/js/coreos-cluster)

Create a fully functional [CoreOs Cluster](https://coreos.com/using-coreos/) on Rackspace Cloud from any node.js application. A command-line version of `coreos-cluster` is available on npm as [`coreos-cluster-cli`](https://npmjs.org/package/coreos-cluster-cli).

#### Quick Example

```javascript
var cluster = require('coreos-cluster');

cluster.createCluster({
  size: 10,
  type: 'performance',
  release: 'beta',
  keyname: 'my-ssh-keyname',
  credentials: {
    username: 'your-user-name',
    apiKey: 'some-key-here',
    region: 'iad'
  }
}, function(err, results) {
  // will callback with a functional cluster
});
```

### Options

- `size` - Optional. Size of the cluster in nodes, minimum/default of 3
- `type` - Optional. `performance` or `onMetal` servers, defaults to `performance` vms
- `release` - Optional. coreos release: `stable` (default), `beta` or `alpha`
- `keyname` - Optional. Rackspace Cloud Servers SSH keyname. If not provided, will create a new ssh key and include in the results
- `flavor` - Optional. The Rackspace Cloud Servers flavor. Defaults to `performance1-1` flavor for `performance` and `onmetal-compute1` for `onMetal`
- `credentials` - Required. The credentials for the create cluster call
  - `username` - Username for your rackspace account
  - `apiKey` - Api key for your rackspace account
  - `region` - Region to create the cluster in
  - `useInternal` - Optional, use local service net interface if calling from Rackspace Cloud machines

### Installation

```
npm install coreos-cluster
```

### Next Steps
As `coreos-cluster` is built on `pkgcloud`, the next step is to add a `provider` option that allows you to use different compute providers within `pkgcloud`.