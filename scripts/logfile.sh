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

# init cache
reset *.log *.txt cache/
reify --loglevel=silent

for (( i="0"; i<=$COUNT; i++ )); do
  # silly
  reset
  reify --offline --loglevel=silly > "01-$i-silly-result.txt"

  # silly + logfile
  reset
  reify --offline --loglevel=silly --logfile="02-$i-silly-logfile.log" > "02-$i-silly-logfile-result.txt"

  # silent
  reset
  reify --offline --loglevel=silent > "03-$i-silent-result.txt"

  # silent + logfile
  reset
  reify --offline --loglevel=silent --logfile="04-$i-silent-logfile.log" > "04-$1-silent-logfile-result.txt"
done
