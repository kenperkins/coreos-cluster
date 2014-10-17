#!/bin/bash -e
source /etc/environment
mkdir -p /etc/systemd/system/etcd.service.d
cat > /etc/systemd/system/etcd.service.d/50-rackspace.conf <<EOF
[Service]
Environment="ETCD_ADDR=${RAX_SERVICENET_IPV4}:4001"
Environment="ETCD_PEER_ADDR=${RAX_SERVICENET_IPV4}:7001"
EOF
systemctl daemon-reload
systemctl restart etcd.service