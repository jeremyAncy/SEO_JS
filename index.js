import amqp from "amqplib/callback_api";
import async from "async";
import mongoose from "mongoose";
import spider_result from "./common/models/spider_result";
import { console } from "./config";
import ServiceImage from "./image-service";
import ServiceTitle from "./title-service";

async.parallel({
    mongo: function (callback) {

        //mongodb://utilisateur:motdepasse@url:port
        //attention, utilisateur et motdepasse doivent être url compliant
        console.debug("start mongo connection");
        mongoose.connect("mongodb://root:ynov2018@nexus2.devandstudy.com:9020")
            .then(() => {
                console.debug("mongo connected");
                callback(null, true);
            })
            .catch(err => {
                console.debug("mongo connection failed", err);
                callback(err);
            });
    },
    rabbit: function (callback) {
        //connect to rabbitMQ

        //amqp://utilisateur:motdepasse@url:port
        //attention, utilisateur et motdepasse doivent être url compliant
        amqp.connect("amqp://ynov:ynov2018@nexus2.devandstudy.com:9672", function (err, conn) {
            if (err) {
                console.debug("rabbitMQ connection failed");
                return callback(err);
            }
            conn.createChannel(function (err, ch) {
                if (!err) {
                    console.debug("rabbitMQ connected");
                }
                else {
                    console.debug("rabbitMQ connection failed");
                }
                callback(err, ch);
            });
        });
    }
},
    function (err, results) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        let ch = results.rabbit;

        //TODO changer ce nom, et me dire le nom de votre micro service, et quand vous voulez recevoir une tache
        let q = "images";
        ch.assertQueue(q, { durable: false, maxPriority: 100 });

        //ici vous indiquez le nombre de taches en même temps au max
        ch.prefetch(10);

        console.debug(" [*] Waiting for messages in %s. To exit kill me", q);

        console.log("-------------");


        //exemple html :
        var html = '<html><head><p>titi</p><p></p><p>test 1</p><title>Sport en direct, Match en direct, infos sport en temps réel - Eurosport</title></head><body bgcolor="white"><center><h1>504 Gateway Time-out</h1></center>' +
            '<hr><center>nginx</center> <img src="/wp-content/uploads/flamingo.jpg">' +
            '<img src="/wp-content/uploads/flamingo.jpg" alt="flamingo"> <img src="/wp-content/uploads/flamingo.jpg" alt=""> </body></html>';

        var serviceImage = new ServiceImage();
        var objectImage = serviceImage.getImage(html);
        console.log(objectImage);

        console.log("-------------");

        var serviceTitle = new ServiceTitle();
        var objectTitle = serviceTitle.getTitle(html);
        console.log(objectTitle);

        console.log("-------------");


        ch.consume(q, function (msg) {
            let task;
            try {
                task = JSON.parse(msg.content.toString());
            }
            catch (e) {
                console.error("Can't parse msg", e);
                return;
            }

            //////////////////////////////////
            //////////VOTRE CODE ICI//////////
            //////////////////////////////////

            var spiderResultId = task._id;
            if (!spiderResultId) {
                console.error("The message doen't contain the object id of mongo document.");
                ch.ack(msg);
                return;
            }

            spider_result.findById(spiderResultId, function (fetchError, result) {
                if (fetchError) {
                    console.error("Failed to fetch spider result for id " + spiderResultId + ". Error : ");
                    console.error(JSON.stringify(fetchError));
                    ch.ack(msg);
                    return;
                }

                if (!result) {
                    console.error("No spider result for id " + spiderResultId + ".");
                    ch.ack(msg);
                    return;
                }

                var html = result.html
                if (!html) {
                    console.error("No spider html found in the spider result " + JSON.stringify(result) + ".");
                    ch.ack(msg);
                    return;
                }

                var serviceImage = new ServiceImage();
                var objectImage = serviceImage.getImage(html);
                console.log(objectImage);

                console.log("-------------");

                var serviceTitle = new ServiceTitle();
                var objectTitle = serviceTitle.getTitle(html);
                console.log(objectTitle);

                //données à renvoyer aux API REST image et title
            });

            //////////////

            //cette commande pour dire que vous avez finis votre tache en cours
            //ch.ack(msg);
        }, { noAck: false });
    });

