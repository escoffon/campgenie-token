#!/usr/bin/env bash

# Cleans the builds before each compile. If we don't do that, the generated artifacts may be incorrect
# and result in weird errors like "Invalid number of arguments to Solidity function"
#
# This seems to be especially true when importing code from 3rd party packages like openzeppelin

# we use the globally installed truffle
#TRUFFLE="node_modules/.bin/truffle"
TRUFFLE="truffle"

rm -rf builds
${TRUFFLE} compile
