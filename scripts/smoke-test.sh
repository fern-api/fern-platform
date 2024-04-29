#!/usr/bin/env sh

set -e

url="$1"

curl https://fern-platform-test.docs.dev.buildwithfern.com/api-reference/imdb/create-movie

if [[ $my_var == *"World"* ]]; then
    echo "Variable contains 'World'"
else
    echo "Variable does not contain 'World'"
fi