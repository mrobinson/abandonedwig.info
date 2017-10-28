#!/usr/bin/env python3

import datetime
import json
import os
import subprocess
import sys
import yaml
from urllib.parse import urlparse

PARENT_PATH = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..")
JEKYLL_PATH = os.path.join(os.path.realpath(__file__), "..", "jekyll")
IMAGES_PATH = os.path.join(PARENT_PATH, "images", "photos")
POSTS_PATH = os.path.join(PARENT_PATH, "jekyll", "_posts", "photos")
DATA_DIR = sys.argv[1]
USER_NAME = os.path.basename(sys.argv[1])


def get_filename(url):
    return os.path.basename(urlparse(url).path)


def run_command(command_string):
    print(command_string)
    (exit_code, output) = subprocess.getstatusoutput(command_string)
    if output:
        print(output)
    if exit_code != 0:
        sys.exit()


with open('{}/{}.json'.format(DATA_DIR, USER_NAME), 'r') as data_file:
    data = json.load(data_file)

run_command("mkdir -p " + POSTS_PATH)

for entry in data:
    timestamp = float(entry['created_time'])
    date = datetime.datetime.utcfromtimestamp(timestamp)
    date_string = date.strftime("%Y-%m-%d")

    if 'caption' in entry and entry['caption'] and 'text' in entry['caption']:
        caption = entry['caption']['text']
    else:
        caption = "Untitled photo"

    images = [get_filename(url) for url in entry['urls']]

    post_file = date_string + "-" + \
        caption.replace(" ", "-") \
        .replace("\"", "") \
        .replace("\'", "") \
        .lower()

    photos_dir = "{}/{}".format(IMAGES_PATH, post_file)
    run_command("mkdir -p " + photos_dir)

    for image in images:
        run_command("cp {}/{} {}".format(DATA_DIR, image, photos_dir))

    object = {
        'layout': 'photos',
        'title': caption,
        'date': date_string,
        'comments': 'false',
        'tags': 'Photos',
        'photos': [{'url': image, 'caption': ''} for image in images],
    }

    post_filename = '{}/{}.html'.format(POSTS_PATH, post_file)
    with open(post_filename, 'w') as post_file:
        post_file.write("---\n")
        post_file.write(yaml.dump(object, default_flow_style=False))
        post_file.write("---\n")