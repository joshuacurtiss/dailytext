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
        var date=$articleHTML.find("header").text().trim();
        var scrip=$articleHTML.find(".themeScrp").text().trim();
        var ref=$articleHTML.find("a em").last().parent().text();
        var body=$articleHTML.find(".bodyTxt").text().trim();
        article=new Article(date,scrip,body,ref);
    });
    return article;
}

function handleResponse(err,resp,html)
{
    var article=createArticleFromHTML(html);
    console.log(article.toSpokenString());
}

// Kick off the process by request the URL. For testing, read and pass in a test HTML file.
var d=new Date().toISOString().slice(0,10).replace(/\-/g,"/"); // Formats in yyyy/mm/dd which is how it appears in the URL.
request(URL+d,handleResponse);
//var htmlString = fs.readFileSync('test.htm').toString(); handleResponse(null,null,htmlString);