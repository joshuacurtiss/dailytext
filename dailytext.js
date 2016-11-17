var cheerio=require("cheerio");
var request=require("request");
var fs=require("fs");

const longpause="[[slnc 1750]]";
const medpause="[[slnc 800]]";
const shortpause="[[slnc 400]]"; 
const url="http://wol.jw.org/en/wol/dt/r1/lp-e/";

const scripReplacements=[
    {short:/Gen\.\s/gi,long:"Genesis"},
    {short:/Ex\.\s/gi,long:"Exodus"},
    {short:/Lev\.\s/gi,long:"Leviticus"},
    {short:/Num\.\s/gi,long:"Numbers"},
    {short:/Deut\.\s/gi,long:"Deuteronomy"},
    {short:/Josh\.\s/gi,long:"Joshua"},
    {short:/Judg\.\s/gi,long:"Judges"},
    /* Ruth */
    {short:/1\sSam\.\s/gi,long:"First Samuel"},
    {short:/2\sSam\.\s/gi,long:"Second Samuel"},
    {short:/1\sKi\.\s/gi,long:"First Kings"},
    {short:/2\sKi\.\s/gi,long:"Second Kings"},
    // TODO: 1 Chron
    // TODO: 2 Chron
    // TODO: Ezra
    // TODO: Nehemiah
    // TODO: Esther
    /* Job */
    {short:/Ps\.\s/gi,long:"Psalms"},
    {short:/Prov\.\s/gi,long:"Proverbs"},
    {short:/Eccl\.\s/gi,long:"Ecclesiastes"},
    {short:/Song\sof\sSol\.\s/gi,long:"Song of Solomon"},
    {short:/Isa\.\s/gi,long:"Isaiah"},
    {short:/Jer\.\s/gi,long:"Jeremiah"},
    // TODO: Lamentations
    {short:/Ezek\.\s/gi,long:"Ezekiel"},
    {short:/Dan\.\s/gi,long:"Daniel"},
    // TODO: Hosea
    // TODO: Joel
    /* Amos */
    // TODO: Obadiah
    // TODO: Jonah
    {short:/Mic\.\s/gi,long:"Micah"},
    // TODO: Nahum
    // TODO: Habakkuk
    // TODO: Zeph
    {short:/Hag\.\s/gi,long:"Hag eye"},
    {short:/Zech\.\s/gi,long:"Zechariah"},
    {short:/Mal\.\s/gi,long:"Malachi"},
    {short:/Matt\.\s/gi,long:"Matthew"},
    /* Mark */
    /* Luke */
    /* John */
    /* Acts */
    {short:/Rom\.\s/gi,long:"Romans"},
    {short:/1\sCor\.\s/gi,long:"First Corinthians"},
    {short:/2\sCor\.\s/gi,long:"Second Corinthians"},
    {short:/Gal\.\s/gi,long:"Galatians"},
    {short:/Eph\.\s/gi,long:"Ephesians"},
    {short:/Phil\.\s/gi,long:"Phillipians"},
    {short:/Col\.\s/gi,long:"Colossians"},
    {short:/1\sThess\.\s/gi,long:"First Thessalonians"},
    {short:/2\sThess\.\s/gi,long:"Second Thessalonians"},
    {short:/1\sTim\.\s/gi,long:"First Timothy"},
    {short:/2\sTim\.\s/gi,long:"Second Timothy"},
    // TODO: Titus
    // TODO: Philemon
    {short:/Heb\.\s/gi,long:"Hebrews"},
    {short:/Jas\.\s/gi,long:"James"},
    {short:/1\sPet\.\s/gi,long:"First Peter"},
    {short:/2\sPet\.\s/gi,long:"Second Peter"},
    {short:/1\sJohn\.\s/gi,long:"First John"},
    {short:/2\sJohn\.\s/gi,long:"Second John"},
    {short:/3\sJohn\.\s/gi,long:"Third John"},
    // TODO: Jude
    {short:/Rev\.\s/gi,long:"Revelation"}
];

// Replaces abbreviates scripture citations with speakable versions
function replaceScriptures(text)
{
    // Loop thru scripture list and replace with long versions
    for( var i=0 ; i<scripReplacements.length ; i++ )
    {
        var rep=scripReplacements[i];
        text=text.replace(rep.short,rep.long+" ");
    }
    return text;
}

// Replaces reference material with speakable version
function calcReference(txt)
{
    var months=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var numbers=["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
    // Calculate the year
    var year=txt.substr(1,2);
    var fullyear=(year<40?"20":"19")+year;
    // Variable out will be an array of all spoken content
    var out=["Watchtower"];
    var split=txt.split(" ");
    // If the year is 2016 or later, use the different "w16.03 2:10-12" format...
    if( year>15 && year<40 )
    {
        var issue=txt.substr(5,1);
        // Output "year, issue number"
        out.push(fullyear+",");
        out.push(numbers[issue-1]+" issue,");
        // Pop off the first array entry containing the "w16.03" text, leaving just "article:paragraph" text
        split.shift();
    }
    // ... Otherwise, process the old style "w15 9/15 2:10-12" format
    else
    {
        var date=split[1];
        var datesplit=date.split("/");
        // Output spoken month, day, year, like "September 15, 2015"
        out.push(months[datesplit[0]-1]);
        out.push(datesplit[1]+",");
        out.push(fullyear+",");
        // Pop off the first two array entries containing "w15 9/15", leaving just "article:paragraph" text 
        split.shift();
        split.shift();
    }
    // Figure out how to speak the "article:paragraph" text
    var artpar=split.join(" ");
    out.push("article "+artpar.replace(":",", paragraph "));
    // Spit it out!
    return out.join(" ");
}

function handleRequest(err,resp,html)
{
    // Build a virtual DOM of the content
    var $=cheerio.load(html);
    var today=new Date();
    // Loop thru all the "tabContent" divs, containing articles, but there will be more than one.
    $(".docClass-DailyText").map(function(idx,item){
        var $article=$(this);
        // Retrieve the "date" text
        var date=$article.find("header").text().trim();
        // Retrieve the "theme scripture" text, then 1) Use speakable scripture, 2) Pause before citation, 3) Pause between chapter:verse.
        var scrip=$article.find(".themeScrp").text().trim();
        scrip=replaceScriptures(scrip);
        scrip=scrip.replace("—",` ${medpause} `);
        scrip=scrip.replace(/(\d+):(\d+)/g,"$1[[slnc 200]]$2");
        // Retrieve and calculate the reference material, making it speakable.
        var origref=$article.find("a em").last().parent().text();
        var speechref=calcReference(origref);
        // Retrieve body of text and tweak it...
        var body=$article.find(".bodyTxt").text().trim();
        body=replaceScriptures(body);                                               // Make scriptures speakable
        body=body.replace(/\)\s/g,`). ${shortpause} `);                             // Pause after citations
        body=body.replace(/—/g,` ${shortpause} `);                                  // Pause for dashes
        body=body.replace(origref,`${longpause} Reference material: ${speechref}`); // Replace the reference material speakable text
        body=body.replace(/(\d+)\-(\d+)/g,"$1 through $2");                         // Use "A thru B" for places where paragraphs or verses have a range like 1-3. 
        body=body.replace(/(\d+):(\d+)/g,"$1[[slnc 125]]$2");                       // Pause between chapter:verse or article:paragraph. 
        // Output the speakable text!
        console.log(`Daily text for ${date}.\n${longpause}\nTheme scripture. ${medpause} ${scrip}\n${longpause}\n${body}`);
    });
}

// Kick off the process by request the URL. For testing, read and pass in a test HTML file.
var d=new Date().toISOString().slice(0,10).replace(/\-/g,"/"); // Formats in yyyy/mm/dd which is how it appears in the URL.
request(url+d,handleRequest);
//var htmlString = fs.readFileSync('test.htm').toString(); handleRequest(null,null,htmlString);