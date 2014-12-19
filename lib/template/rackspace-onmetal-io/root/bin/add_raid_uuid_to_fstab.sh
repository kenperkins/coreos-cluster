#!/bin/bash
UUID=`lsblk -o NAME,TYPE,UUID | grep raid0 | awk '{print $3}' | head -n1`
grep -q $UUID /etc/fstab && echo "Device already in fstab" && exit 0
echo "UUID=$UUID /var/lib/docker btrfs defaults 0 1" >> /etc/fstab
mkdir -p /var/lib/docker
mount /var/lib/docker
chown root:root /var/lib/docker
chmod 700 /var/lib/docker