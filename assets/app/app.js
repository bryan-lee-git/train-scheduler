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
  }; firebase.initializeApp(config);

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
$("#schedule-table").hide();

// display running clock on page
function displayTime() {
    var now = new Date().toLocaleTimeString();
    document.getElementById("local-time").innerText = now;
} window.setInterval(displayTime, 1000);

// function for filling data into the table
function fillData(childSnapshot) {

    // stuff for getting next train time and minutes until next train
    var newDateConverted = moment(childSnapshot.val().firstTime, "HH:mm").subtract(1, "years");
    var trainFreq = childSnapshot.val().freq;

    // Difference between the times
    var diffTime = moment().diff(moment(newDateConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % trainFreq;

    // Minute Until Train
    var tMinutesTillTrain = trainFreq - tRemainder;

    // If minutes til next train = 0, display that the train is now boarding
    if (tRemainder === 0) {
        tMinutesTillTrain = "NOW BOARDING";
    }

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");

    // add stored info and calculations from stored info to the table
    $("tbody").append(
        "<tr id='" + childSnapshot.val().trainNumber + "'>"
        + "<td><p>" +  childSnapshot.val().name + "</p></td>"
        + "<td><p>" +  childSnapshot.val().dest + "</p></td>"
        + "<td><p>" +  childSnapshot.val().freq + "</p></td>"
        + "<td><p>" +  moment(nextTrain).format("hh:mm") + "</p></td>"
        + "<td><p>" + tMinutesTillTrain  + "</p></td>"
        + "<td style='text-align:center;'><p><span value='" + childSnapshot.val().trainNumber + "' class='trash-can'>🗑</span></p></td>"
        + "</tr>"
    )
    
    // create easily referenced variable for the new row
    var newRow = document.getElementById(trainId);

    // hide the row initially
    $(newRow).hide();

    // fade the row into view
    $(newRow).fadeIn(1000);

}

// fill table from database storage
database.ref().orderByChild("name").on("child_added", function(childSnapshot) {

    // display the table on the page
    $("#schedule-table").slideDown(500);

    // run the stored data through the fill data function
    fillData(childSnapshot);

    trainId++;

}, 

// if error occurs...
function(errorObject) {
    console.log("The read failed: " + errorObject.code);
}); 

function reloadData() {

    trainId = 0;

    // fill table from database storage
    database.ref().orderByChild("name").on("value", function(snapshot) {

        // empty out the table body
        $("tbody").empty();

        // display all data
        snapshot.forEach(function(childNodes){
            // re-run the stored data through the fill data function
            fillData(childNodes);
            trainId++;
        })
    }, 

    // if error occurs...
    function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

$("#refresh-btn").on("click", function() {
    reloadData();
})

// when information is submitted via the scheduler form, update the database
$("#schedule-submit").on("click", function(event) {
        
    //prevent default form submit action
    event.preventDefault();

    // set input variables to object key/value pairs
    database.ref().push({
        trainNumber: parseInt(trainId),
        name: $("#name-input").val(),
        dest: $("#dest-input").val(),
        freq: $("#freq-input").val(),
        firstTime: $("#time-input").val()
    });

    // reset the form inputs
    document.getElementById("schedule-form").reset();

});

// delete row and stored data when trash can icon is clicked
$("#trains-table").on("click", ".trash-can", function(event) {

    // get unique identifier value to delete desired row of data from page and from storage
    var deleteBtn = parseInt($(this).attr("value"));

    // prevent any default click functions
    event.preventDefault();

    // make sure we are getting the value we want
    console.log(deleteBtn);

    // delete from table
    document.getElementById(deleteBtn).remove();

    // remove this child/row of data from the database
    database.ref().on("value", function(snapshot) {

        // for each child in the database
        snapshot.forEach(function(childNodes){
            
            // if the child's trainNumber equals the value of the clicked delete button
            if (childNodes.val().trainNumber == deleteBtn) {
                
                // remove that child from the database 
                database.ref(childNodes.key).remove();
                trainId--;

            };
        });
    });

    // if there are no trains listed, hide the table from view
    if (trainId == 0) {
        $("#schedule-table").slideUp(500);
    
    // else reload data to display updated train info in the table 
    } else {
        reloadData()
    };

});
