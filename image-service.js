const cheerio = require('cheerio');

function ServiceImage() { }

ServiceImage.prototype.getImage = function (html) {
    var altword = [];
    var altwordSup = [];
    var altTotal = 0;
    var altNovide = 0;
    var altNumberWord = 0; // Comptabilise le nombre de balise alt > 80 words

    var $ = cheerio.load(html);

    $('img').each(function (i, elem) {

        altTotal++;
        if ($(this).attr('alt') == null) {

        } else if ($(this).attr('alt') != "") {
            var test = $(this).attr('alt').trim();
            var numberofCarac = $(this).attr('alt').length;
            var arrayOfStrings = test.split(" ");

            if (numberofCarac >80){
                altNumberWord ++;
            }

            for (var i = 0; i < arrayOfStrings.length; i++) {
                if (arrayOfStrings[i].length > 3) {
                    altword.push(arrayOfStrings[i]);
                } else {
                    altwordSup.push(arrayOfStrings[i]);
                }
            }
            altNovide++;
        }
    });

    var kpi = altNovide / altTotal;
    var pourcentWord = (altNumberWord/ altTotal)*100;
    var element = { KPI_ALT: kpi, WORD: altword, WORDSUP: altwordSup, WORDSUPALT: pourcentWord };
    return element;

}

module.exports = ServiceImage;