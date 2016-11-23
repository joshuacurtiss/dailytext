class Article {
    
    constructor( date, scripture, content, reference ) {
        this.date=date;
        this.scripture=scripture;
        this.reference=reference;
        this.content=content.replace(reference,"");
        this.ttsEngine="SAY";
    }

    get ttsEngine() {
        return this._ttsengine;
    }

    set ttsEngine(engineName) {
        var name=engineName.toUpperCase();
        if( Article.SPEECH.hasOwnProperty(name) ) this._ttsengine=name;
        else throw "No engine is registered by that name.";
    }

    get date() {return this._date}
    set date(text) {
        this._date=text.trim();
        this._spokenDate="";
    }

    get spokenDate() {
        if(!this._spokenDate.length) {
            this._spokenDate=this.date;
        }
        return this._spokenDate;
    }

    get scripture() {return this._scripture}
    set scripture(text) {
        this._scripture=text.trim();
        this._spokenScripture="";
    }

    get spokenScripture() {
        if(!this._spokenScripture.length) {
            const SPEECH=Article.SPEECH[this.ttsEngine];
            var txt=this.scripture;
            // Convert scripture name.
            txt=calcScriptureNames(txt);
            // Add pause for the citation dash.
            txt=txt.replace("—",` ${SPEECH.MEDIUMPAUSE} `);
            // Force a pause between chapter:verse.
            txt=txt.replace(/(\d+):(\d+)/g,`$1${SPEECH.TINYPAUSE}$2`);
            this._spokenScripture=txt;
        }
        return this._spokenScripture;
    }

    get content() {return this._content}
    set content(text) {
        this._content=text.trim();
        this._spokenContent="";
    }

    get spokenContent() {
        if(!this._spokenContent.length) {
            const SPEECH=Article.SPEECH[this.ttsEngine];
            var txt=this.content;
            txt=calcScriptureNames(txt);                                    // Make scriptures speakable
            txt=txt.replace(/\)\s/g,`). ${SPEECH.SHORTPAUSE} `);            // Pause after citations
            txt=txt.replace(/—/g,` ${SPEECH.SHORTPAUSE} `);                 // Pause for dashes
            txt=txt.replace(/(\d+)\-(\d+)/g,`$1 through $2`);               // Use "A thru B" for places where paragraphs or verses have a range like 1-3. 
            txt=txt.replace(/(\d+):(\d+)/g,`$1${SPEECH.TINYPAUSE}$2`);      // Pause between chapter:verse or article:paragraph. 
            this._spokenContent=txt;
        }
        return this._spokenContent;
    }

    get reference() {return this._reference}
    set reference(text) {
        this._reference=text.trim();
        this._spokenReference="";
    }

    get spokenReference() {
        if(!this._spokenReference.length) {
            const SPEECH=Article.SPEECH[this.ttsEngine];
            var txt=this.reference;
            txt=calcReference(txt);                                          // Calculate the reference
            txt=txt.replace(/(\d+)\-(\d+)/g,`$1 through $2`);               // Use "A thru B" for places where paragraphs or verses have a range like 1-3. 
            txt=txt.replace(/(\d+):(\d+)/g,`$1${SPEECH.TINYPAUSE}$2`);      // Pause between chapter:verse or article:paragraph. 
            this._spokenReference=txt;
        }
        return this._spokenReference;
    }

    toSpokenString() {
        const SPEECH=Article.SPEECH[this.ttsEngine];
        return  `Daily text for ${this.spokenDate}.\n`+
                `${SPEECH.LONGPAUSE}\n`+
                `Theme scripture: ${SPEECH.MEDIUMPAUSE} ${this.spokenScripture}\n`+
                `${SPEECH.LONGPAUSE}\n`+
                `${this.spokenContent} ${SPEECH.LONGPAUSE} Reference material: ${this.spokenReference}`;
    }

    toString() {
        return `${this.date}\n\n${this.scripture}\n\n${this.content} (${this.reference})`;
    }
}

// Constants
Article.SPEECH={
    "SAY": {
        "LONGPAUSE": "[[slnc 1750]]",
        "MEDIUMPAUSE": "[[slnc 800]]",
        "SHORTPAUSE": "[[slnc 400]]",
        "TINYPAUSE": "[[slnc 200]]" 
    },
    "SSML": {
        "LONGPAUSE": "<break time='1550ms'/>",
        "MEDIUMPAUSE": "<break time='750ms'/>",
        "SHORTPAUSE": "<break time='400ms'/>",
        "TINYPAUSE": "<break time='180ms'/>" 
    }
};
Article.SCRIPTURENAMES=[
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
    {short:/1\sJohn\s/gi,long:"First John"},
    {short:/2\sJohn\s/gi,long:"Second John"},
    {short:/3\sJohn\s/gi,long:"Third John"},
    // TODO: Jude
    {short:/Rev\.\s/gi,long:"Revelation"}
];

// Calculates speakable version of abbreviated scripture citations
function calcScriptureNames(text) {
    // Loop thru scripture list and replace with long versions
    for( var i=0 ; i<Article.SCRIPTURENAMES.length ; i++ )
    {
        var rep=Article.SCRIPTURENAMES[i];
        text=text.replace(rep.short,rep.long+" ");
    }
    return text;
}

// Calculates speakable version of reference material
function calcReference(txt) {
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

module.exports=Article;