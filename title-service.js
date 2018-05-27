import { console } from './config';

const cheerio = require('cheerio');

function ServiceTitle() { }

var indexTitle = 0;

function getIndexBalise(element) {
    var prevItem = element.prev();

    if(prevItem.html() != null) {
        indexTitle++;
        getIndexBalise(prevItem);
    }

}

ServiceTitle.prototype.getTitle = function (html) {
    var goodSize = false;
    var linkingWords = 0;
    var $ = cheerio.load(html);

    var title = $('title').text();

    console.log($('title').prev().html());

    if($('title').prev() == null) {
        console.log("juju");
    }

    
    getIndexBalise($('title'));
    console.log(indexTitle);

    var titleLength = title.length;
    if(titleLength >= 55 && titleLength <= 65) {
        goodSize = true;
    }

    var arrayOfStrings = title.split(" ");
    arrayOfStrings.forEach(element => {
        if(element.length < 3) {
            linkingWords++;
        }
    });
    
    var element = {
        //titre de la balise title
        title: title,
        //index de la balise title par rapport à la balise parente <head>
        indexTitle: indexTitle,
        //status de la taille des caractères de la balise <title>, vrai si elle est entre 55 et 66 sinon faux
        goodSize: goodSize,
        //la taille des caractères de <title>
        titleLength: titleLength,
        //le nombre de mots de liaison (plus il y en a, moins bien c'est)
        linkingWords: linkingWords
    };

    return element;
    
}

module.exports = ServiceTitle;