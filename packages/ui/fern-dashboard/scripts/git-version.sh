#!/usr/bin/env bash

if [[ -n "$CIRCLE_TAG" ]]; then
	echo "$CIRCLE_TAG"
	exit 0
fi

# if we're not on a tag in Circle but the current commit is tagged, then
# should then ignore the tag
tag="$(git describe --exact-match --tags HEAD 2> /dev/null || :)"
version="$(git describe --tags --always --first-parent)"

result="$(echo "$version" | sed 's/^fdr@//;s/^ui@//;s/^dashboard@//')"

echo "$result"