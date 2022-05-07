const puppeter = require('puppeteer');
const cheerio =require('cheerio');
const ObjectsToCsv = require('objects-to-csv');


const url='https://allegro.pl/kategoria/akcesoria-dysze-318741?order=qd';
const url_name="akcesoria-dysze"
let broswer;
let decriptionpages;

async function dateToSave(data,name){
    
    new ObjectsToCsv(data).toDisk(`./${name}.csv`, { append: true }); //dodawanie do pliku
    // new ObjectsToCsv(sampleData).toDisk(`./${name}.csv`); // tworzy nowey plik bez dodawania 

}



async function scrapHomeIndex(url,page){
    try{
    console.log(url);

    await page.goto(url,{waitUntil:"networkidle2"});
    const html= await page.evaluate(()=>document.body.innerHTML);
    const $= await cheerio.load(html);
     

    const  homes= $("article").map((i,element)=>{
            let name=$(element).attr("aria-label");
            let link = $(element).find("a").attr("href");
            let cena = $(element).find('span._lf05o').attr("aria-label");
            let cena_d = $(element).find('div.mqu1_g3').text();
            let ilosc_z = $(element).find('span.msa3_z4').text();
            let spon = $(element).find('div._6a66d_qjI85').text();
            let ads;
            if(spon=="Oferta sponsorowana"){ ads="ADS"} else {ads='NO_ADS'}
            // POBIERANIE ZDJECIA ZE STRONY DOPSIAC 
            // DANE KONTAKTOWE FIRMY 
            // regexp=/Dane firmy(?:(?!Dane|Konkat).)*Kontakt/gm
           let id=i
           let quot=0;
           if(quot==0){
             let q=$("div[role='navigation']>span").text(); // ilosc podstron na stronie      
             quot=q.substr(0,q.length/2);
            }
           
                    // let c=i+';'+';'+s+';'+name+';'+cena+';'+cena_d+';'+ilosc_z+';'+link;
            if(name!=undefined){
                return {id,ads,name,cena,cena_d,ilosc_z,link,quot};
            }

    }).get();
   

 
    
    return homes;
     
    }catch(err){
        console.log(err);
    }
    
}

async function getAdress(url){
    try{

        const page =await broswer.newPage();
        await page.goto(url,{waitUntil:"networkidle2"});
        const html= await page.evaluate(()=>document.body.innerHTML);
        const $= await cheerio.load(html);

             
        const  link_category=$('a[data-role="LinkItemAnchor"]').map((i,element)=>{
            let link=$(element).attr("href");// link do categoerii
            let link_name=$(element).text();
            return {link,link_name};

        }).get();
        return link_category;

    }catch(err){
        console.log(err);
    }

}

  async function pagePagines(){
    broswer =await puppeter.launch({headless:false});
    decriptionpages=await broswer.newPage();

    const link_category=await getAdress(url);
    
   
    let dane;
    let ogr;
    // console.log(link_category);

    for(i=0;i<link_category.length;i++){
        if(i==0){

            dane= await scrapHomeIndex(url,decriptionpages); 
            await dateToSave(dane,url_name); 
            // console.log(dane);
            ogr=Number(dane[0].quot);//  tutaj będzie problem z danymi
            for(j=2;j<=ogr;j++){
                console.log(j);
                      let  curl=url+'&p='+j
                        dane= await scrapHomeIndex(curl,decriptionpages); 
                        await dateToSave(dane,url_name); 
                      
            }
            
            }
        if(i>0){
            // console.log(ogr);
            for(j=2;j<=ogr;j++){
                console.log(j);
                      let  curl='https://allegro.pl'+link_category[i].link+'&p='+j
                        dane= await scrapHomeIndex(curl,decriptionpages); 
                        await dateToSave(dane,link_category[i].link_name); 
                      
            }
            let curl='https://allegro.pl'+link_category[i].link;
            dane= await scrapHomeIndex(curl,decriptionpages); 
            await dateToSave(dane,link_category[i].link_name); 
            // console.log(dane);
            ogr=Number(dane[0].quot);
            

        }
    }

    

}
pagePagines();