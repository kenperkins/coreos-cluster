#!/bin/bash
for blockdev in `/root/bin/lsi_device_paths.sh`; do
    echo "Applying SSD settings to ${blockdev}"
    echo noop | tee /sys/block/${blockdev}/queue/scheduler
    echo 4096 | tee /sys/block/${blockdev}/queue/nr_requests
    echo 1024 | tee /sys/block/${blockdev}/queue/max_sectors_kb
    echo 1 | tee /sys/block/${blockdev}/queue/nomerges
    echo 512 | tee /sys/block/${blockdev}/device/queue_depth
done