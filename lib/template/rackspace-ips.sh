#!/bin/bash
for i in `ip a | grep -- 'inet ' | awk '{print $2}' | grep -v '^127.' | cut -d'/' -f1`; do
  case `echo $i | cut -d. -f1` in
    "10")
      echo "Writing RAX_SERVICENET_IPV4=$i to /etc/environment"
      echo "RAX_SERVICENET_IPV4=$i" >> /etc/environment
      ;;
    "192")
      echo "Writing RAX_PRIVATENET_IPV4=$i to /etc/environment"
      echo "RAX_PRIVATENET_IPV4=$i" >> /etc/environment
      ;;
    "172")
      echo "Writing RAX_ETCDNET_IPV4=$i to /etc/environment"
      echo "RAX_ETCDNET_IPV4=$i" >> /etc/environment
      ;;
    *)
      echo "Writing RAX_PUBLICNET_IPV4=$i to /etc/environment"
      echo "RAX_PUBLICNET_IPV4=$i" >> /etc/environment
      ;;
  esac
done