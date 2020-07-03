#!/bin/sh
cd "$(dirname "$0")"
USER='abandonedwhig'
pipenv run instagram-scraper --login-user $USER --login-pass ` pass show instagram.com | head -1` --latest --media-metadata $USER
pipenv run ./generate.py $USER
