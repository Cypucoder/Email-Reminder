var express = require('express');
var app = express();
var mysql = require('mysql');
var server = require('http').createServer(app);
var io = require ('socket.io')(server);
var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");
var moment = require('moment');
var async = require('async');

//Necessary for email
var smtpTransport = nodemailer.createTransport("SMTP",{
host: 'email.business.org',
port: 25,
domain:'domain.org',
tls: {ciphers:'SSLv3'}
//auth: {
//user: "itrequest@business.org",
//pass: "pass"
//}
});

// Keeps track of all the users online (mainly for use in chat systems, but could be useful for responding to [or commenting on] tickets)
var users = []

//Links mySQL database to the Node server
var db = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: 'pass', 
    database: 'db'
    //port: 3000;
});
 
var socket;

io.on('connection', function(socket){
    //Lets the admin know when a user is connected. Only states when a connection is made to the login/landing page.
    console.log('A user connected');    
    
    socket.on('create_Item', function(Item){
        //console.log(Item);
        create_Item(Item, function(res){
            if(res){
                //io.emit('refresh feed', msg);
                //console.log('refresh feed, status ');
            } else {
                io.emit('error');
                console.log('there was an error under socket.on check_Out');
            }
        });
    });
    
    //disconnects link to server to prevent too many connections to the server
    socket.on('disconnect', function() {
     //Code inserted in here will run on user disconnect. 
     console.log('A user has disconnected');
        socket.disconnect();
        
    });
    
    

});

//used to start and run the server
server.listen(3006, function(){
    console.log("listening on *:3006");
});

app.use(express.static('files'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

var runtimeNumb = 0;

var create_Item = function (Item, callback){
    
    console.log("connecting create_Item");
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in at the create_Item function');
            connection.release();
            callback(false);
            return;
        }
            
        console.log("connected");
        //Item, patron ID
        var ReqVar = [Item.s_To, Item.s_From, Item.s_Subject, Item.s_Body, Item.s_StartDate, Item.s_Frequency];
        //v_Image v_ID v_Desc v_Group
        console.log(ReqVar);
        connection.query("INSERT INTO `emailreminders`.`emailreminders` ( `v_To`, `v_From`, `v_Subject`, `v_Body`, `v_Date`, `v_Frequency`) VALUES (?, ?, ?, ?, ?, ?)", ReqVar, function(err, rows){
            console.log("sending");
            if (!err){
                
                }
        });
    })
}

var interval = setInterval(function() {
        console.log("Sending email reminders");
         
        db.getConnection(function(err, connection){
            if(err){
                console.log('there was an issue in the Interval section');
                connection.release();
                callback(false);
                return;
            } 
              
            console.log(moment().date());
            var todaysDay = moment().date();
        connection.query("SELECT * FROM emailreminders.emailreminders WHERE Day(emailreminders.v_Date) = "+todaysDay+" ", function(err, rows){
                 if(!err) {
                   
                }
        if(rows.length != '0'){
                console.log("Length: "+rows.length);
            
             for (var i = 0; i <= rows.length; i++)
                {
                    console.log(rows[i]);
                                  console.log("/*================InnerLoop"+i+"==========================*/"); 
                                    /*================Mail==========================*/
                                     console.log('Emailing to: '+ rows[i].v_To);
                                     //console.log('Title: '+ rows[i].title);
                                        var mailOptions={
                                            to : 'Event <'+ rows[i].v_To +'>',
                                            subject : rows[i].v_Subject,
                                            html : rows[i].v_Body,
                                            from: 'Business <'+rows[i].v_From+'>'
                                        }

                                            //console.log(mailOptions);
                                        smtpTransport.sendMail(mailOptions, function(error, response){
                                            if(error){
                                                console.log(error);

                                            }else{
                                                console.log("Message sent: " + response.message);
                                                }
                                        });
                                    /*==============================================*/
                                    console.log("/*================InnerLoop end==========================*/");
                                    console.log("End loop 2 for loop "+i);
                    if(i == rows.length - 1)
                        {
                            //for some completely insane reason, the loop does not want to self stop when it's supposed to until you add in this code to manually quit it (at least on smaller loops)
                            break;
                        }
                }
            
        }else{
                console.log("No new emails to send out.")
            }
    });
            
            
            connection.release();
           
        });
    
    }, 1000 * 60 * 60 * 24);