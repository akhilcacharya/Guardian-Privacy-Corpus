# Guardian Privacy Corpus

Goal: Extract a text corpus from the Guardian on **Government-related Privacy News**, and perform analysis. 

# Setup 

* Install node modules by doing ``npm install``

* Install python modules by doing ``pip install -r requirements.txt``

Jupyter notebooks can be run with Python 2 and Python 3 kernels. 

The Node.js script requires async/await support in the latest versions of Node.js (we used 7.7.1). 

# Navigating the Results 

The overall article corpus may be found at this [link](https://drive.google.com/open?id=0ByZdUPsaQTSvbzV1WEcxMjlPZG8) 

The URLs of each category can be found in the ARTICLE_URLS folder, where each document is titled with its category. 

The clusters may be found in the CLUSTER folder, with each document is titled with the category it is associated with. 

The wordmaps may be found in the WORDMAP folder, and the topics for each category can be found in the TOPICS folder. 

The RESULTS folder contains raw data in the form of CSV files, as well as the overall list of search terms used during the data collection process. 
