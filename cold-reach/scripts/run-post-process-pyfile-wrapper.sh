#!/bin/bash -xe

script_dir=$(cd $(dirname "$0") && pwd)
log_dir="$script_dir/log"
$script_dir/run-post-process-pyfile.sh $* \
	1>> "$log_dir/post-process-pyfile.log" \
	2>> "$log_dir/post-process-pyfile.err"


