const puppeter = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
// const { find } = require('cheerio/lib/api/traversing');
const ObjectsToCsv = require('objects-to-csv');


const data = 'https://allegro.pl/kategoria/czesci-do-laptopow-77801?order=qd';
let broswer;
let decriptionpages;
let zm = 0;
async function dateToSave(data,name){
    
    new ObjectsToCsv(data).toDisk(`./data/${name}.csv`, { append: true }); //dodawanie do pliku
    // new ObjectsToCsv(sampleData).toDisk(`./${name}.csv`); // tworzy nowey plik bez dodawania 

}
function resRegNumberInt(text) { 
    if(text!=null){
        let reg=/[0-9] o|[0-9]{2} o|[0-9]{3} o|[0-9]{4} o/gm
        let reg_c =new RegExp(reg)
        let regres=reg_c.exec(text)
        // console.log(regres[0])
        let result=0;
        if(regres!=null) {
              
                    reg=/[0-9]{4}|[0-9]{3}|[0-9]{2}|[0-9]/gm
                    reg_c =new RegExp(reg)
                    regres=reg_c.exec(regres[0])
                    result=regres[0]
                    //  console.log(result)
                    return result;
                };
    }
     else {return 0}     


}

function resReg(text) { 
    if(text!=null){
        const reg=/[0-9],[0-9]{2}|[0-9]{2},[0-9]{2}|[0-9]{3},[0-9]{2}|[0-9] [0-9]{3},[0-9]{2}|[0-9]{2} [0-9]{3},[0-9]{2}|[0-9]{4},[0-9]{2}|[0-9]{5},[0-9]{2}/gm
        const reg_c =new RegExp(reg)
        const regres=reg_c.exec(text)
        // console.log(regres)
        let result=0;
        if(regres!=null) {result=regres[0]} 
     return result;
    }
     else {return 0}     


}

async function scrapHomeIndex(url) {
    try {

        const page = await broswer.newPage()
        await page.goto(url, { waitUntil: "networkidle2" });
        if (zm == 0) {
            await page.click('[data-role="accept-consent"]');
            zm++;
        }
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cheerio.load(html);


        const  homes= $("article").map((i,element)=>{
            let name=$(element).attr("aria-label");
            let link = $(element).find("a").attr("href");
            let cena = $(element).find('span._lf05o').attr("aria-label");
            let cena_d = $(element).find('div.mqu1_g3').text();
            let ilosc_z = $(element).find('span.msa3_z4').text();
            let spon = $(element).find('div._6a66d_qjI85').text();
            let s=$(element).find('span').hasClass('_6a66d_fIdpb');
            let ads;
            if(spon=="Oferta sponsorowana"){ ads=1} else {ads=0}
                
                let cena_dost
            if (cena_d==null || cena_d=='darmowa dostawa') {cena_dost=0} else{
                cena_dost=resReg(cena_d)            }
            
                let cena_produktu=resReg(cena)
            
                let ilosc_zakupionych=0
            if (ilosc_z!=null) {ilosc_zakupionych=resRegNumberInt(ilosc_z)}
       
            
                 
           let id=i
           let quot=0;
           let smart
           if(s==true){ smart=1} else {smart=0}
           if(quot==0){
             let q=$("div[role='navigation']>span").text(); // ilosc podstron na stronie z produktami
             quot=q.substr(0,q.length/2);
            }
           
                    
            if(name!=undefined){
                return {id,ads,name,cena_produktu,cena_dost,ilosc_zakupionych,ilosc_z,link,smart,quot};
            }

    }).get();





        return homes;

    } catch (err) {
        console.log(err);
    }

}




async function getAdress(link, page) {
    try {

        await page.goto(link, { waitUntil: "networkidle2" });
        // await page.click('[data-role="accept-consent"]');
        await page.click('[href="#about-seller"]')
        // await page.waitForNavigation()
        await page.waitForSelector('div.mves_qm.m3h2_8')
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cheerio.load(html);
        //    const body = $('body').text();
        const company = $('div.mves_qm.m3h2_8').text()
        const pol_sprze=$('[href="#about-seller"]').text();
        const ocena_prod=$("[data-analytics-view-custom-rating-value]").attr("data-analytics-view-custom-rating-value")
        // let ilosc_zakupionych=resReg(ilosc_z,/\d,d{2}|\d{2},\d{2}|\d{3},\d{2}|\d \d\d\d,\d{2}|\d{2} \d\d\d,\d{2}||\d{3} \d\d\d,\d{2}/);
       
       data_sc =`${Date()}`.slice(4,15);

       return {data_sc,company,ocena_prod,pol_sprze}


    } catch (err) {
        console.log(err);
    }

}

async function pagePagines() {
    let proxy="zporxy"

    broswer = await puppeter.launch({ headless: false,
        args: [`"--proxy-server =${proxy}"`]
    });
    decriptionpages = await broswer.newPage();
    const dane = await scrapHomeIndex(data)
    console.log(dane)
    // const sprz=await getAdress(dane[0].link, decriptionpages)
    
    // cos = Object.assign(dane[0], sprz);
    // console.log(cos); 

    // console.log(dane)
    // for (i = 0; i < dane.length; i++) {
    //    await getAdress(dane[i].link, decriptionpages)


    // }
   


}
pagePagines();