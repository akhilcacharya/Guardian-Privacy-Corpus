const guardian = require('guardian-news'); 

const config = require('./config.json'); 

guardian.config({
    apiKey: config.secret_key,
    pageSize: 50, 
}); 

const keywords = [
    'gchq surveillance NOT (nsa OR usa OR america)',
    'gchq surveillance law NOT (nsa OR usa OR america)', 
    'dgse surveillance NOT (nsa OR usa OR america)' 
]


async function getArticles(query){
    return await new Promise((resolve, reject) => {
        resolve(guardian.content({q: query})); 
    }); 
}

async function main(){
    keywords.forEach(async keyword => {
        const { response } = await getArticles(keyword); 

        const { pageSize, pages, results } = response; 

        const titles = results.map(item => item.webTitle); 
        
        console.log(keyword, pages, results.length, "\n", titles);
    }); 
}

main(); 