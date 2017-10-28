USER='abandonedwhig'
pipenv run instagram-scraper --login-user $USER --login-pass ` pass show instagram.com | head -1` --media-metadata $USER
pipenv shell ./generate.py $USER
