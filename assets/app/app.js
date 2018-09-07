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

// -----------------------------------------------------------------------------------------------------------------
// FIREBASE INITIALIZATION
// -----------------------------------------------------------------------------------------------------------------

var config = {
    apiKey: "AIzaSyAOmMa5QrzqwbnEyp_ZQ31Aj3PSY7kQl4U",
    authDomain: "train-scheduler-69b6a.firebaseapp.com",
    databaseURL: "https://train-scheduler-69b6a.firebaseio.com",
    projectId: "train-scheduler-69b6a",
    storageBucket: "train-scheduler-69b6a.appspot.com",
    messagingSenderId: "534200773830"
  }; 
  
firebase.initializeApp(config);

// create easily accessible, global variable for firebase database
var database = firebase.database();

// -----------------------------------------------------------------------------------------------------------------
// GLOBAL VARIABLES
// -----------------------------------------------------------------------------------------------------------------

// create empty array variables that will hold the user's form input and input saved on database
var allTrains = [];
var trainId = 0;
var nextArrival = "";
var minutesAway = "";
var now = new Date().toLocaleTimeString();

// -----------------------------------------------------------------------------------------------------------------
// PROGRAM
// -----------------------------------------------------------------------------------------------------------------

// always initially hide table on page load
$("#schedule-table").hide(0);

// display running clock on page
function displayTime() {
    var now = new Date().toLocaleTimeString();
    document.getElementById("local-time").innerText = now;
} window.setInterval(displayTime, 1000);

// function to create next train times based upon first train time
function trainTimes(train) {

    // time conversion functions
    function timestrToSec(timestr) {
        var parts = timestr.split(":");
        return (parts[0] * 3600) + (parts[1] * 60) + (+parts[2]);
    }
    
    function pad(num) {
        if(num < 10) {
            return "0" + num;
        } else {
            return "" + num;
        }
    }
    
    function formatTime(seconds) {
        return [pad(Math.floor(seconds/3600)%60),
            pad(Math.floor(seconds/60)%60),
            pad(seconds%60),
            ].join(":");
    }

    time1 = "00:00:" + train[2];
    time2 = "00:" + train[3];

    timeLeft = formatTime(timestrToSec("00:24:00") - timestrToSec(time2));
    possibleRoutes = timestrToSec("00:24:00") / timestrToSec(time1);
    arrivalTimes = ["00:00:00"];

    function truncateString (str1, length) {
  
        if ( (str1.constructor === String) && (length > 0) ) {
            return str1.slice(3, length);
        }
    };

    for (let i = 0; i < possibleRoutes; i++) {

        time2 = arrivalTimes[arrivalTimes.length-1];
        nextTime = formatTime(timestrToSec(time1) + timestrToSec(time2));
        nextArrival = truncateString(nextTime, 8);
        arrivalTimes.push(nextTime);
    }

    date = "00:" + Date().slice(16,21);
    routesLeft = Math.ceil(timestrToSec(date) / timestrToSec(time1));
    nextArrival = arrivalTimes[routesLeft];
    minutesAway = timestrToSec(nextArrival) - timestrToSec(date);
    nextArrival = truncateString(nextArrival, 8); 
};

// function to fill in a new row of train data into the scheduler table
function fillTable(userInput) {
    trainTimes(userInput);
    trainId++;
    $("tbody").append(
        "<tr id='" + trainId + "'>" 
        + "<td>" + userInput[0] + "</td>"
        + "<td>" + userInput[1] + "</td>"
        + "<td>" + userInput[2] + "</td>"
        + "<td>" + nextArrival + "</td>"
        + "<td>" + minutesAway + "</td>" 
        + "<td style='text-align:center;'><span value='" + trainId + "' class='trash-can'>🗑</span></td>"
        + "<td style='text-align:center;'><span value='" + trainId + "' class='edit-pen'>🖋</span></td>"
        + "</tr>"
    );
    
};

// fill table from database storage
function fillFromData() {
    database.ref().on("value", function(trainData) {

        // set id to zero since we are loading the data into the table
        trainId = 0;

        // remove any info in the table body
        $("tbody").empty();

        // set the allTrains variable to equal the info located in the database
        allTrains = trainData.val().allTrains;

        // for every item currently in the database
        for (let i = 0; i < allTrains.length; i++) {

            // grab each item
            var loadedTrain = allTrains[i];

            // run it through the fillTable function to display in table
            fillTable(loadedTrain);
        };

        // display the table on the page
        $("#schedule-table").slideDown(400);

    }); 
} fillFromData();

// when information is submitted via the scheduler form
$("#schedule-submit").on("click", function(event) {
        
    //prevent default form submit action
    event.preventDefault();
    var trainInput = [];
    trainId++;

    // push all user input to the trainInput array
    trainInput.push($("#name-input").val());
    trainInput.push($("#dest-input").val());
    trainInput.push($("#freq-input").val());
    trainInput.push($("#time-input").val());
    trainInput.push(parseInt(trainId));

    // push new trainInput array to allTrains array
    allTrains.push(trainInput);

    // update the database with the new train information
    database.ref().set({allTrains});

    // reset the form inputs
    document.getElementById("schedule-form").reset();

});

// delete row and stored data when trash can is clicked
$("#trains-table").on("click", ".trash-can", function(event) {

    //get unique identifier value to delete desired row of data from page and from storage
    var deleteBtn = $(this).attr("value");

    // prevent any default click functions
    event.preventDefault();

    // make sure we are getting the value we want
    console.log(deleteBtn);

    // remove the train from our storage array matchin the unique identfier
    allTrains.splice([deleteBtn] - 1, 1);

    // make sure we deleted what we wanted to

    // update the database with the new data
    database.ref().set({allTrains});

    $(deleteBtn.parent).remove();

});

// delete row and stored data when trash can is clicked
$("#trains-table").on("click", ".edit-pen", function(event) {

    // get unique identifier value to delete desired row of data from page and from storage
    var editBtn = $(this).attr("value");

    // prevent any default click functions
    event.preventDefault();

    // hide user input area
    $("#user-input").hide();

    // create edit area
    var editArea = $("<div id='edit-input' class='container'></div>")

    // create edit form
    var editForm = $("<form id='schedule-form'><div class='form-group'><label for='name-edit'>Edit Train Name</label><input id='name-edit' class='form-control' type='text' placeholder='" + allTrains[editBtn-1][0] + "'><br><label for='dest-edit'>Edit Train Destination</label><input id='dest-edit' class='form-control' type='text' placeholder='" + allTrains[editBtn-1][1] + "'><br><label for='time-edit'>Edit First Train Arrival Time</label><input id='time-edit' class='form-control' type='time' placeholder='" + allTrains[editBtn-1][2] + "'><br><label for='freq-edit'>Edit Frequency (In Minutes)</label><input id='freq-edit' class='form-control' type='number' placeholder='" + allTrains[editBtn-1][3] + "'><br><button id='schedule-edit' type='submit' class='btn btn-primary'>Edit</button><button id='schedule-cancel' class='btn btn-danger'>Cancel</button></div></form>");
    
    // add edit area to page
    $("body").append(editArea);

    // add edit form to edit area
    editArea.append(editForm);

    // perform initial hide of edit area
    editArea.hide(0);

    //fade edit area in on page
    editArea.fadeIn(1000);

    // when information is submitted via the schedule editor form
    $("#schedule-edit").on("click", function(event) {
            
        //prevent default form submit action
        event.preventDefault();
        var editInput = [];

        // push all user input to the trainInput array
        editInput.push($("#name-edit").val());
        editInput.push($("#dest-edit").val());
        editInput.push($("#freq-edit").val());
        editInput.push($("#time-edit").val());

        // push new trainInput array to allTrains array
        allTrains.splice([editBtn-1], 1);
        allTrains.splice([editBtn-1], 0, editInput);

        // update the database with the new train information
        database.ref().set({allTrains});

        // reset the form inputs
        editArea.hide(0);
        $("#user-input").fadeIn(1000);
    }); 

    // if user clicks cancel edit button
    $("#schedule-cancel").on("click", function(event) {
        event.preventDefault();
        editArea.hide(0);
        $("#user-input").fadeIn(1000);
    }); 

});
