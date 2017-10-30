#!/bin/sh
cd "$(dirname "$0")"

pipenv shell
USER='abandonedwhig'
pipenv run instagram-scraper --login-user $USER --login-pass ` pass show instagram.com | head -1` --latest --media-metadata $USER
./generate.py $USER
