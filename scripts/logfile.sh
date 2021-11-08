#!/usr/bin/env bash

set -xe

ADD="$1"
COUNT=$2

reset () {
  rm -rf node_modules/ "$@"
}

reify () {
  ../../../bin/index.js reify --add="$ADD" --cache=./cache --save=false --audit=false "$@"
}

rm -rf ./scripts/benchmark/logfile/
mkdir -p ./scripts/benchmark/logfile/
cd ./scripts/benchmark/logfile/

reset *.log *.txt

for (( i="1"; i<=$COUNT; i++ )); do
  # init cache
  reset cache/
  reify --loglevel=silent > "$i-00-baseline-result.txt"

  # silly
  reset
  reify --offline --loglevel=silly > "$i-01-silly-result.txt"

  # silly + logfile
  reset
  reify --offline --loglevel=silly --logfile="$i-silly-logfile.log" > "$i-02-silly-logfile-result.txt"

  # silent
  reset
  reify --offline --loglevel=silent > "$i-03-silent-result.txt"

  # silent + logfile
  reset
  reify --offline --loglevel=silent --logfile="$i-silent-logfile.log" > "$i-04-silent-logfile-result.txt"
done

# wc of each logfile
wc -l *.log

# Show outputs
grep "" *.txt
