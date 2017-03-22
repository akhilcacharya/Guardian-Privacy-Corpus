const guardian = require('guardian-news'); 
const request = require('async-request'); 
const qs = require('querystring'); 

const fs = require('fs'); 

const config = require('./config.json'); 

const PAGE_SIZE = 200 // Max page size

guardian.config({
    apiKey: config.secret_key,
}); 

const keywords = [
    'gchq surveillance NOT (nsa OR usa OR america)',
    'gchq surveillance law NOT (nsa OR usa OR america)', 
    'dgse surveillance NOT (nsa OR usa OR america)' 
]


async function getArticlesUrls(query, idx){
    return await guardian.content({
            q: query, 
            pageSize: PAGE_SIZE, 
            page:idx
    }); 
}

async function getMetadata(query){
    return await  guardian.content({
            q: query, 
            pageSize: PAGE_SIZE, 
    }); 
}

async function fetchArticleText(url){
    const query = qs.encode({'show-blocks': 'body', 'api-key': config.secret_key}); 
    const { body } = await request(url + "?" + query); 
    const { response } = JSON.parse(body); 

    const corpus = response.content.blocks.body.reduce((acc, item) => {
        return acc += item.bodyTextSummary + "\n"
    }, ""); 

    return corpus; 
}


async function main(){

    const urlSet = {}; 

    for(let i = 0; i < keywords.length; i++){
        const keyword = keywords[i]; 
        const { response } = await getMetadata(keyword); 
        let pageIdx = 1
        let total = response.total
        console.log(keyword, total)
    
        let resultCount = 0; 

        while(total > 0){
            //Keep increasing the page count
            const { response } = await getArticlesUrls(keyword, pageIdx); 
            const { results } = response; 
        
            results.forEach(result => {
                urlSet[result.apiUrl] = true
                console.log(`${resultCount}/${response.total}`, result.apiUrl)
                total--; 
                resultCount++; 
            }); 

            pageIdx++; 
        }
    }; 


    Object.keys(urlSet).forEach(async url => {
        //console.log(fetchArticle(url))
    }); 
}

main(); 