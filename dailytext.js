var environment = process.env.NODE_ENV || "production";
var cheerio=require("cheerio");
var request=require("request");
var fs=require("fs");
var Article=require("./model/Article");

const URL="http://wol.jw.org/en/wol/dt/r1/lp-e/";

function createArticleFromHTML(html)
{
    // Build a virtual DOM of the content
    var article="";
    var $=cheerio.load(html);
    // Find main document container and process it.
    $(".docClass-DailyText").map(function(idx,item){
        var $articleHTML=$(this);
        // Retrieve the raw text and instantiate and Article object
        var date=$articleHTML.find("header").text();
        var scrip=$articleHTML.find(".themeScrp").text();
        var body=$articleHTML.find(".bodyTxt").text();
        article=new Article(date,scrip,body);
    });
    return article;
}

function handleResponse(err,resp,html)
{
    if (err) {
        console.error('Seems You have no internet connection :( Internet is Required to grab the HTML!');
        return;
    }
    var article=createArticleFromHTML(html);
    var ttsEngine=process.argv.length>2?process.argv[2]:"";
    if( ttsEngine!="" ) {
        article.ttsEngine=ttsEngine;
        console.log(article.toSpokenString());
    } else console.log(article.toString());
}

// Kick off the process by request the URL. For testing, read and pass in a test HTML file.
if( environment=="production" ) {
    var d=new Date().toISOString().slice(0,10).replace(/\-/g,"/"); // Formats in yyyy/mm/dd which is how it appears in the URL.
    request(URL+d,handleResponse);
} else {
    fs.readFile('test.htm', (err, data) => {
        if (err) throw "Could not read test file. Create a test.htm file to mock up a web request.";
        handleResponse(null,null,data.toString());
    });
}