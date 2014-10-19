#!/bin/bash -e

fail() {
  echo $@
  exit 1
}

# Machine ID is "free" from systemd. This also is bonus protection
# against someone running this outside of systemd and breaking their machine.
MACHINE_ID=${1}
[ -z "$MACHINE_ID" ] && fail "error; machine ID should be passed in"

GFILE="/etc/${MACHINE_ID}.raid-setup"
[ -e "${GFILE}" ] && echo "${GFILE} exists, raid already setup?" && exit 0

[ -b "/dev/md0" ] && mdadm --stop /dev/md0

BLOCKS=""
for blockdev in `/root/bin/lsi_device_paths.sh`; do
  BLOCKS="${BLOCKS} /dev/${blockdev}"
done

yes | mdadm --create --verbose -f /dev/md0 --level=stripe --raid-devices=2 ${BLOCKS}
mkfs.btrfs /dev/md0
touch /etc/${MACHINE_ID}.raid-setup