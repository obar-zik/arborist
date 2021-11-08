#!/usr/bin/env bash

set -xe

ACTION=${1:-reify}
LOGLEVEL="${2:-silent}"
COUNT=${3:-20}

PACKAGE=$(cat <<-END
{
  "name": "benchmark",
  "version": "1.0.0",
  "dependencies": {
    "@testing-library/jest-dom": "^5.14.1",
    "@testing-library/react": "^12.0.0",
    "@testing-library/user-event": "^13.2.1",
    "@types/jest": "^27.0.1",
    "@types/node": "^16.7.13",
    "@types/react": "^17.0.20",
    "@types/react-dom": "^17.0.9",
    "typescript": "^4.4.2",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-scripts": "4.0.3",
    "web-vitals": "^2.1.0",
    "ink": "^3.2.0",
    "tap": "^15.0.10"
  }
}
END
)

DIR="./scripts/benchmark/logfile"

if [ $ACTION == "reify" ]; then
  rm -rf $DIR
  mkdir -p $DIR
  cd $DIR

  reset () {
    rm -rf node_modules/ package.json "$@"
    echo $PACKAGE > package.json
  }

  reify () {
    ../../../bin/index.js reify --cache=./cache --save=false --audit=false "$@"
  }

  # warm cache
  reset *.log *.txt cache/
  reify --loglevel=silent

  for (( i="0"; i<=$COUNT; i++ )); do
    id=`printf %03d $i`
    # no logfile
    reset
    reify --offline --loglevel="$LOGLEVEL" > "00-$id-$LOGLEVEL-noofile.txt"

    # logfile
    reset
    reify --offline --loglevel="$LOGLEVEL" --logfile="01-$id-$LOGLEVEL.log" > "01-$id-$LOGLEVEL-logfile.txt"
  done
else
  wc -l $DIR/*.log
  grep "" $DIR/*.txt
fi

