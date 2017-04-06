const qs = require('querystring')
const request = require('async-request'); 
const fs = require('fs'); 
const all = require('await-all'); 
const config = require('./config.json'); 

function writeJSONToFile(name, doc){
    fs.writeFileSync(name, JSON.stringify(doc)); 
}

async function fetchArticleText(key, q, url){
    const query = qs.encode({
        'show-blocks': 'body', 
        'api-key': key
    }); 

    const finalUrl = `${url}?${query}`; 

    try {
        const { body } = await request(finalUrl); 
                
        const { response } = JSON.parse(body); 

        const corpus = response.content.blocks.body.reduce((acc, item) => {
            return acc += item.bodyTextSummary + "\n"
        }, ""); 

        fs.writeFileSync("CORPUS/${q}/${response.content.webTitle}_${response.content.webPublicationDate}.txt", corpus); 
    } catch(e){
        console.log("exception"); 
        console.log(e); 
    }

    return null; 
}


async function main(){
    const args = process.argv.slice(2)

    if(args.length != 1){
        console.log("Usage: extract.sh LIST_OF_URLS.txt")
        return; 
    }

    const file = args[0]; 
    const query = file.split('.txt')[0]; 

    const urls = fs.readFileSync(`RESULTS/${file}`).toString().trim().split('\n'); 

    //Find the key in the config
    const configs = config.filter(search => search.name == query);
    
    if(configs.length == 0){
        console.log("No key found for search term"); 
        return; 
    }
    
    const key = configs[0].secret_key; 

    const urlFutures = urls.map(url => {
        return fetchArticleText(key, query, url)
    }); 

    if(!fs.existsSync(`CORPUS/`)){
        fs.mkdirSync(`CORPUS/`)
    }

    if(!fs.existsSync(`CORPUS/${query}`)){
        fs.mkdirSync(`CORPUS/${query}`)
    }

    const results = await all(urlFutures); 

    console.log("Done"); 
}

main(); 

