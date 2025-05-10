#!/bin/sh

if [ $# -ne 2 ] ; then
  echo "Usage: $0 original copy"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: Unstaged changes present. Please commit or stash them before running this script."
  exit 1
fi

git mv "$1" "$2"
git commit -n -m "Split history $1 to $2 - rename file to target-name"
REV=`git rev-parse HEAD`
git reset --hard HEAD^
git mv "$1" temp
git commit -n -m "Split history $1 to $2 - rename source-file to temp"
git merge $REV
git commit -a -n -m "Split history $1 to $2 - resolve conflict and keep both files"
git mv temp "$1"
git commit -n -m "Split history $1 to $2 - restore name of source-file"
