// -----------------------------------------------------------------------------------------------------------------
// REMAINING ASSIGNMENT CHALLENGES
// -----------------------------------------------------------------------------------------------------------------

// add train edit functionality
// make it so that only users who log into the site with their Google or GitHub accounts can use your site.

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

// -----------------------------------------------------------------------------------------------------------------
// GLOBAL VARIABLES
// -----------------------------------------------------------------------------------------------------------------

// create easily accessible, global variable for firebase database
var database = firebase.database();
// create empty array variables that will hold the user's form input and input saved on database
var allTrains = [];
// counter id for unique identifiers
var trainId = 0;

// -----------------------------------------------------------------------------------------------------------------
// FUNCTIONS
// -----------------------------------------------------------------------------------------------------------------

// function for displaying running clock on page
function displayTime() {
    var now = new Date().toLocaleTimeString();
    document.getElementById("local-time").innerText = now;
};

// function for filling data into the table and calculating dynamic content values (next train time, minutes til train)
function fillData(train) {

    // stuff for getting next train time and minutes until next train
    var newDateConverted = moment(train.val().firstTime, "HH:mm").subtract(1, "years");
    var trainFreq = train.val().freq;

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
        "<tr id='" + train.val().trainNumber + "'>"
        + "<td><p>" +  train.val().name + "</p></td>"
        + "<td><p>" +  train.val().dest + "</p></td>"
        + "<td><p>" +  train.val().freq + "</p></td>"
        + "<td><p>" +  moment(nextTrain).format("hh:mm") + "</p></td>"
        + "<td><p>" + tMinutesTillTrain  + "</p></td>"
        + "<td style='text-align:center;'><p><span value='" + train.val().trainNumber + "' class='trash-can'>🗑</span></p></td>"
        + "</tr>"
    )
    
    // create easily referenced variable for the new row
    var newRow = document.getElementById(train.val().trainNumber);

    // hide the row initially
    $(newRow).hide();

    // fade the row into view
    $(newRow).fadeIn(1000);

    trainId++;

};

// function to reload data table
function reloadData() {

    trainId = 0;

    // get a snapshot of the current database
    database.ref().once("value", function(snapshot) {

        // empty out the table body
        $("tbody").empty();

        // for each child stored in the root of the database 
        snapshot.forEach(function(childNode){

            // run through the fill data function
            fillData(childNode);
            
        });

    }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
};

// -----------------------------------------------------------------------------------------------------------------
// PROGRAM
// -----------------------------------------------------------------------------------------------------------------

// automatically hide table from view until data has been loaded into it
$("#schedule-table").hide();

// display the user's current time on the screen and update every second
window.setInterval(displayTime, 1000);

// fill table from database storage, first loops through all, then completes once any time a child node is added
database.ref().orderByChild("name").on("child_added", function(childSnapshot) {

    $("#schedule-table").slideDown(500);

    trainId++;

    // run the stored data through the fill data function
    fillData(childSnapshot);

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// -----------------------------------------------------------------------------------------------------------------
// EVENT HANDLERS
// -----------------------------------------------------------------------------------------------------------------

// when information is submitted via the scheduler form, update the database
$(document).on("click", "#schedule-submit", function(event) {
    
    //prevent default form submit action
    event.preventDefault();

    var trainNumber = trainId;
    var name = $("#name-input").val();
    var dest = $("#dest-input").val();
    var freq = $("#freq-input").val();
    var firstTime = $("#time-input").val();

    // set input variables to object key/value pairs
    database.ref().push({
        trainNumber: trainNumber,
        name: name,
        dest: dest,
        freq: freq,
        firstTime: firstTime
    });
    
    // reset the form inputs
    document.getElementById("schedule-form").reset();

});

// refresh data when refresh button is clicked
$(document).on("click", "#refresh-btn", function(event) {
    event.preventDefault();
    reloadData();
});

// delete row and stored data when trash can icon is clicked
$("#main-container").on("click", ".trash-can", function(event) {

    // prevent any default click functions
    event.preventDefault();

    trainId--;

    // get unique identifier value to delete desired row of data from page and from storage
    var deleteBtn = parseInt($(this).attr("value"));

    // make sure we are getting the value we want
    console.log(deleteBtn);

    // delete from table
    $(deleteBtn).remove();

    // remove this child/row of data from the database
    database.ref().once("value", function(snapshot) {

        // for each child in the database
        snapshot.forEach(function(childNode) {
            
            // if the childNode's trainNumber equals the value of the clicked delete button
            if (childNode.val().trainNumber === deleteBtn) {
                var deleteId = childNode.key;
                // remove that child from the database 
                database.ref(deleteId).remove();
            }
        });
    });

    // reload data
    reloadData();

    // if trainI is still 0 after reloading data, slide the schedule table from view
    if (trainId == 0) {
        $("#schedule-table").slideUp(500);
    }
});
