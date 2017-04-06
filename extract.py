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

BASE_PATH = "./RESULTS/"

def collect_corpus(body_list): 
    result = "" 

    for body in body_list: 
        result += body["bodyTextSummary"] + "\n"

    return result 

def fetch_article_text(url, key):
    qs = {
        'show-blocks': 'body', 
        'api-key': key
    }

    url += '?' + urllib.urlencode(qs)

    r = requests.get(url)
    
    response = r.json() 

    result = {}

    content = response['response']['content']

    title = content['webTitle']
    date = content['webPublicationDate']
    body = content["blocks"]["body"]
    
    print("Processing " + title)

    text = collect_corpus(body)

    result = {
        "title": title, 
        "date": date, 
        "body": text, 
    }
    
    # Filter into date, text
    return result 


def fetch_query_corpus(arg_tuple): 

    path, query_text, key = arg_tuple


    with open(BASE_PATH + path) as url_file: 
        lines = url_file.read().split('\n')
    
    results = []

    print("Processing " + query_text)

    # TODO: REMOVE LIMITATION
    for line in lines[:100]: 
        result = fetch_article_text(line, key)        
        results.append(result)

    # Print results to file
    filename = "CORPUS/%s.json" % (query_text)
    with open(filename, 'w') as outfile:
        json.dump(results, outfile, indent=4)

def main():     
    with open('config.json') as config_file: 
        config = json.load(config_file)

    # Convert query name -> key map 
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
    
    path_len = len(paths)

    p = Pool(path_len)
    p.map(fetch_query_corpus, args)

    print "Done"

if __name__ == '__main__': 
    main()


