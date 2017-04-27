'''
Migrated JS script to Python for extraction purposes
Usage: python extract.py

Extracts JSON files for each file in RESULTS folder 
'''
import requests
import json 
from pprint import pprint
import urllib
import os
import time
from multiprocessing import Pool

BASE_PATH = "./ARTICLE_URLS/"
 
def collect_corpus(body_list): 
    """ Iterates through the body of the text docs, 
        and accumulates a full text body""" 
    
    result = "" 

    for body in body_list: 
        result += body["bodyTextSummary"] + "\n"

    return result 

def fetch_article_text(url, key):
    """ Grab the article text for a given URL """
    qs = {
        'show-blocks': 'body', 
        'api-key': key
    }

    url += '?' + urllib.urlencode(qs)

    r = requests.get(url)
    
    response = r.json() 

    result = {}

    try: 
        content = response['response']['content']
    except KeyError: 
        return None

    title = content['webTitle']
    date = content['webPublicationDate']
    body = content["blocks"]["body"]
    
    print("Processing " + title)

    # Combine sub-parts of the body into 1 string
    text = collect_corpus(body)

    # Return an object with the title, date, and text body
    result = {
        "title": title, 
        "date": date, 
        "body": text, 
    }
    
    # Filter into date, text
    return result 


def fetch_query_corpus(arg_tuple): 
    """ Fetch the query corpus in parallel """ 
    
    # Destructure the tuple (needed for multiprocessing)
    path, query_text, key = arg_tuple

    # Open file and fetch all lines of URLs
    with open(BASE_PATH + path) as url_file: 
        lines = url_file.read().split('\n')
    
    results = []

    print("Processing " + query_text)

    for line in lines:
        result = fetch_article_text(line, key)
        if result != None: 
            results.append(result)

    # Print results to file
    filename = "CORPUS/%s.json" % (query_text)
    with open(filename, 'w') as outfile:
        json.dump(results, outfile, indent=4)

def main():  
    """ Main method """ 

    # Load the configuration file   
    with open('config.json') as config_file: 
        config = json.load(config_file)

    # Create map to associate query term to the secret key 
    query_map = {}

    for item in config: 
        simple_name = item['name']
        query_map[simple_name] = item['secret_key']

    paths = os.listdir(BASE_PATH)

    args = []

    for path in paths: 
        name = path.split('.')[0]
        key = query_map[name]
        args.append((path, name, key))

    # 8 processes - 1 per thread on i7
    PROCESSES = 8

    # Create a pool to process in parallel
    p = Pool(PROCESSES)

    p.map(fetch_query_corpus, args)

    print "Done"

if __name__ == '__main__': 
    main()


