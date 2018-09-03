//* In this assignment, you'll create a train schedule application that incorporates Firebase to host arrival and departure data. Your app will retrieve and manipulate this information with Moment.js. This website will provide up-to-date information about various trains, namely their arrival times and how many minutes remain until they arrive at their station.

//* Make sure that your app suits this basic spec:
//* When adding trains, administrators should be able to submit the following:
//* Train Name
//* Destination 
//* First Train Time -- in military time
//* Frequency -- in minutes
//* Code this app to calculate when the next train will arrive; this should be relative to the current time.
//* Users from many different machines must be able to view same train times.
//* Styling and theme are completely up to you. Get Creative!

//### Bonus (Extra Challenges)

//* Consider updating your "minutes to arrival" and "next train time" text once every minute. This is significantly more challenging; only attempt this if you've completed the actual activity and committed it somewhere on GitHub for safekeeping (and maybe create a second GitHub repo).

//* Try adding `update` and `remove` buttons for each train. Let the user edit the row's elements-- allow them to change a train's Name, Destination and Arrival Time (and then, by relation, minutes to arrival).

//* As a final challenge, make it so that only users who log into the site with their Google or GitHub accounts can use your site. You'll need to read up on Firebase authentication for this bonus exercise.

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAOmMa5QrzqwbnEyp_ZQ31Aj3PSY7kQl4U",
    authDomain: "train-scheduler-69b6a.firebaseapp.com",
    databaseURL: "https://train-scheduler-69b6a.firebaseio.com",
    projectId: "train-scheduler-69b6a",
    storageBucket: "train-scheduler-69b6a.appspot.com",
    messagingSenderId: "534200773830"
  }; firebase.initializeApp(config);

// create easily accessible variable for firebase database
var database = firebase.database();

// GLOBAL VARIABLES

// create an object that will hold the user's form input
var trainInput = [];

trainCount = 0;

// function check database storage on page load
function checkStorage() {

    database.ref().on("value", function(snapshot) {
        var trainData = JSON.stringify(snapshot.val());
        console.log(snapshot.val().train1.info);

    }); 

} checkStorage();

// when information is submitted via the scheduler form
$("#schedule-submit").on("click", function(event) {
    
    //prevent default form submit action
    event.preventDefault();

    // push all user input to the trainInput array
    trainInput.push($("#name-input").val());
    trainInput.push($("#dest-input").val());
    trainInput.push($("#time-input").val());
    trainInput.push(parseInt($("#freq-input").val()));

    // console.log the object to ensure it was appropriately filled in
    console.log(trainInput);

    // run function to fill in table data using user input
    fillTable(trainInput);

    // add the to train counter for data storage purposes
    trainCount++

    // update the database with the train information
    database.ref("train" + trainCount).set({info: trainInput});
})

//function for filling in a new set of train data into the scheduler table
function fillTable(userInput) {
        $("tbody").append("<tr><th scope='row'>" + trainInput[0] + "</th><td>"+ trainInput[1] + "</td><td>" + trainInput[2] + "</td><td>" + trainInput[4] + "</td><td>" + "Stuff" + "</td></tr>");
};