#!/usr/bin/env bash

# . /opt/local/etc/varnish/varnish.conf
VARNISH_CFG="/Users/tsujp/programming/epf_c4/src/varnish/foo.vcl"

VARNISHD_OPTS="-j unix,user=nobody
               -a 127.0.0.1:6081
               -f $VARNISH_CFG
               -T localhost:6082
               -s malloc,64M"

# VARNISHD_PID="/opt/local/var/run/varnish/varnish.pid"
VARNISHD_PID="/Users/tsujp/programming/epf_c4/src/varnish/varnish.pid"

if [[ -r $VARNISHD_PID ]]; then
    read -r PID < "$VARNISHD_PID"
    ps -p $PID &> /dev/null
    CHECK=$?
    if [[ "x$CHECK" == "x1" ]]; then
      unset PID
      rm -f "$VARNISHD_PID"
    fi
fi

case $1 in
    start)
        /opt/local/sbin/varnishd $VARNISHD_OPTS -P $VARNISHD_PID
    ;;
    stop)
        [[ $PID ]] && kill $PID &>/dev/null
    ;;
    restart)
        $0 stop
        sleep 1
        $0 start
    ;;
    reload)
        /opt/local/sbin/varnish-vcl-reload $VARNISH_CFG
    ;;
    *)
        echo "usage: $0 {start|stop|restart|reload}"
    ;;
esac
