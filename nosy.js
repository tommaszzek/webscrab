const puppeter = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { find } = require('cheerio/lib/api/traversing');
const ObjectsToCsv = require('objects-to-csv');


const data = 'https://allegro.pl/kategoria/czesci-do-laptopow-77801?order=qd';
let broswer;
let decriptionpages;
let zm = 0;
async function dateToSave(data,name){
    
    new ObjectsToCsv(data).toDisk(`./data/${name}.csv`, { append: true }); //dodawanie do pliku
    // new ObjectsToCsv(sampleData).toDisk(`./${name}.csv`); // tworzy nowey plik bez dodawania 

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


        const homes = $("article").map((i, element) => {
            let name = $(element).attr("aria-label");
            let link = $(element).find("a").attr("href");
            let cena = $(element).find('span._lf05o').attr("aria-label");
            let cena_d = $(element).find('div.mqu1_g3').text();
            let ilosc_z = $(element).find('span.msa3_z4').text();
            let spon = $(element).find('div._6a66d_qjI85').text();
            let ads;
            if (spon == "Oferta sponsorowana") { ads = "ADS" } else { ads = 'NO_ADS' }


            let id = i

            // let c=i+';'+';'+s+';'+name+';'+cena+';'+cena_d+';'+ilosc_z+';'+link;
            if (name != undefined) {
                return { id, ads, name, cena, cena_d, ilosc_z, link };
            }

        }).get();





        return homes;

    } catch (err) {
        console.log(err);
    }

}


function resReg(text,reg) {  
    const regres=text.match(reg);
    let result='0';
       if(regres[0]!=null) {result=regres[0]} else {result=0;}
    return result;     
// searching the phone number pattern
// const regex2 = /(\d{3})\D(\d{3})-(\d{4})/g;
// const result3 = regex2.exec('My phone number is: 555 123-4567.');

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
    
    const sprz=await getAdress(dane[0].link, decriptionpages)
    
    cos = Object.assign(dane[0], sprz);
    console.log(cos); 
    
    // console.log(dane)
    // for (i = 0; i < dane.length; i++) {
    //    await getAdress(dane[i].link, decriptionpages)


    // }
    // console.log(dane[0].link);
    // POBRAC DANE CZY BYŁA PRZESYŁKA SMART CZY NIE
    // Pobrac email jesli jest na stronie ze szczególami






}
pagePagines();