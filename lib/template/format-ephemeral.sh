#!/bin/bash
echo "Running format-ephemeral.sh"
blkid /dev/xvde | grep btrfs >> /dev/null
if [ $? -eq 0 ]; then
  echo "/dev/xvde already formatted as btrfs"
  exit 0
fi

echo "Wiping /dev/xvde"
wipefs -f /dev/xvde
echo "Formatting /dev/xvde as btrfs"
mkfs.btrfs -f /dev/xvde