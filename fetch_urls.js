const guardian = require('guardian-news'); 
const request = require('async-request'); 
const qs = require('querystring'); 

const fs = require('fs'); 

const PAGE_SIZE = 200;  // Max page size
const API_LIMIT = 5000 - 500; 

const queryList = require('./config.json'); 

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

async function getMetadata(key, query){
    guardian.config({
        apiKey: key,
    }); 

    return await guardian.content({
            q: query, 
            pageSize: PAGE_SIZE, 
    }); 
}

async function fetchArticleText(key, url){
    const query = qs.encode({
        'show-blocks': 'body', 
        'api-key': key
    }); 

    const { body } = await request(url + "?" + query); 
    const { response } = JSON.parse(body); 

    const corpus = response.content.blocks.body.reduce((acc, item) => {
        return acc += item.bodyTextSummary + "\n"
    }, ""); 

    return corpus; 
}


async function main(){

    for(let i = 0; i < queryList.length; i++){
        const query = queryList[i]; 

        const key = query.secret_key; 
        const keyword = query.search_term.trim(); 

        const { response } = await getMetadata(key, keyword); 
        
        let pageIdx = 1
        
        let total = response.currentPage; 

        const reqsLeft = API_LIMIT - 1; //Subtract one for the metadata

        let totalPages = Math.floor(reqsLeft/PAGE_SIZE); 

        const queryUrls = []; 

        while(totalPages > 0){
            const { response } = await getArticlesUrls(key, keyword, pageIdx); 
            const { results } = response; 

            const urls = results.map(result => result.apiUrl);  

            queryUrls.push(...urls);             
            pageIdx++; 
            totalPages--; 
        }

        const resultString = queryUrls.join('\n'); 

        const newFile = fs.writeFileSync(`RESULTS/${query.name}.txt`, resultString); 
    }; 
}

main(); 