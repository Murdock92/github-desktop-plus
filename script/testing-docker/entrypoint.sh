#!/bin/bash

# Exit if any command fails
set -e

cd /app

yarn test:setup
yarn test:unit
yarn test:script

echo '-------------------'
echo 'All tests passed 🎉'
echo '-------------------'
