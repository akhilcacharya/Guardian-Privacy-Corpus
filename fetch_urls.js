const guardian = require('guardian-news'); 
const request = require('async-request'); 
const qs = require('querystring'); 

const fs = require('fs'); 

const PAGE_SIZE = 200;  // Max page size
const API_LIMIT = 5000 - 500; 

const queryList = require('./config.json'); 


/**
 * Get the articles for a particular search query given a key
 * @param {String} key API Key
 * @param {String} query Search query
 * @param {Number} idx Page index 
 */
async function getArticlesUrls(key, query, idx){   
    guardian.config({
        apiKey: key,
    }); 

    return await guardian.content({
            q: query, 
            pageSize: PAGE_SIZE, 
            page:idx
    }); 
}

/**
 * Gets the article list for the article search
 * @param {String} key 
 * @param {String} query 
 */
async function getMetadata(key, query){
    guardian.config({
        apiKey: key,
    }); 

    return await guardian.content({
            q: query, 
            pageSize: PAGE_SIZE, 
    }); 
}

/**
 * Main method; starts the query process
 */
async function main(){

    //Iterate through the list of queries enumerated in the config file
    for(let i = 0; i < queryList.length; i++){
        const query = queryList[i]; 

        const key = query.secret_key; 
        const keyword = query.search_term.trim(); 

        console.log("Processing", keyword); 

        // Fetch the metadata 
        const { response } = await getMetadata(key, keyword); 
        
        let pageIdx = 1
        
        let total = response.currentPage; 

        const reqsLeft = API_LIMIT - 1; //Subtract one for the metadata

        let totalPages = Math.floor(reqsLeft/PAGE_SIZE); 

        const queryUrls = []; 

        //While there are pages remaining, fetch an article group
        while(totalPages > 0){
            const { response } = await getArticlesUrls(key, keyword, pageIdx); 
            const { results } = response; 

            //Filter to get only the API urls
            const urls = results.map(result => result.apiUrl);  
            
            //Push to the list
            queryUrls.push(...urls);             
            pageIdx++; 
            totalPages--; 
        }

        const resultString = queryUrls.join('\n'); 

        //Print out the file when done
        const newFile = fs.writeFileSync(`ARTICLE_URLS/${query.name}.txt`, resultString); 
    }; 
}

main(); 