 //==================================================================================================================
 //                                          Connecting to the G-Bat Network
 //==================================================================================================================
 var me = {
     id: 40,
     name: 'Operator Control Unit'
 };
 
 
var DISABLED = 0;
var MANUAL = 1;
var AUTO = 2;
var SUCCESS = true,
    FAILED = false;
    
 var missionSpooler={
     id:36,
     name:'Mission Spooler' 
 };
 var subSystemCommander = {
     id:32,
     name: 'Sub-System Commander'
 };

 var systemTree = [me];


 var socket = io('http://localhost:3000');// ip address of the G-Bat network

 socket.on('connect', function() {
     console.log(socket.id); // 'G5p5...'
     console.log('\n\n => Connection to the G-Bat Network has been established!!\n\n');
     // console.log(sensorIo);

     socket.on('register', (regData, identify) => {
         identify(me);
     });
     socket.on('registration', (regInfo) => {
         console.log(`\n => A ${regInfo.name} has connected to the G-Bat Network!`);
     });

     socket.on('deregistration', (regInfo) => {
         console.log(`\n => A ${regInfo.name} has disconnected from the G-Bat Network!`);
     });

     socket.on('systemUpdate', (update) => {

         systemTree = update;
         console.log('\n\n => Connected Nodes: ', JSON.stringify(systemTree, null, 4));

     });
     // Hanling disconnection
     //----------------------
     socket.on('disconnect', () => {
         console.log('Connection to the G-Bat network has been terminated!');
     });

     // 2.1 SetTravelSpeed : Message ID = 040Ah
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set 
    // set the travel speed

    socket.on('040Ah', (nodeInfo) => {
        var travelSpeed = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = travelSpeed; // ideally update with data readfrom hardware
        nodeInfo.sequenceNo = 1;

        console.log('\n\n => Setting Travel Speed...\n\n');

    });

    // 2.2  ExecuteList : Message ID = 041Eh
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set command
    // execute the list as set in nodeInfo.data

    socket.on('041Eh', (nodeInfo) => {
        var ExecuteList = nodeInfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.sequenceNo = 1;

        console.log('\n\n =>Executing  List...\n\n');
        console.log(`\n\n =>The received list is  ${ExecuteList}`);

        nodeInfo.data = ExecuteList; // ideally update with executed list and status ( probably in a loop)
    });


    // 2.3 QueryTravelSpeed : Message ID = 240Ah
    //----------------------------------------------------
    // Respond with message ID : 440Ah => ReportTravelSpeed
    socket.on('240Ah', (nodeInfo) => {
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Travel Speed received  from ${nodeInfo.sender.name}!`);
        console.log(`\null => sending Travel Speed data to ${nodeInfo.sender.name}...`);

        // get Global Pose data from hardware. Here we use dummy data    
        var LPoseData = {
            "Timestamp": Date.now(),
            "x": 15,
            "y": -25,
            "r": 20.5,
            "speed": 1.3
        };
        // Format the packet to send  
        nodeInfo.messageID = '440Ah';
        nodeInfo.data = LPoseData;
        nodeInfo.sequenceNo = 1;
        // send the response -> this block of code must be in a function   
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        socket.emit(nodeInfo.messageID, nodeInfo, (ack) => { //socket io emit block
            if (ack.recipient === 'undefined') {
                console.log('recipient node did not respond!');
            } else {

                console.log('\n\n => ack :->  ', JSON.stringify(ack, null, 4));
            }
        });//end of socket io emit block
    });

    // 2.4 SetWrenchEffort : Message ID = 0405h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set 
    // set the Wrench Effort

    socket.on('0405h', (nodeInfo) => {
        var wrenchEffort = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = wrenchEffort; // ideally update with data readfrom hardware
        nodeInfo.sequenceNo = 1;

        console.log('\n\n => Setting wrench effort...\n\n');

    });

     // 3.1 Variables that will  hold the converted wrench effort
    //  into values that actually drives the stepper and servo motors
    /*****************************************************************
     
    Here they are declared  as an object 'primitiveDriver' and initialized
    The methods or functions could be added here too.Please modify the name 
    of variables accordingly */

    var primitiveDriver = {
        
                // attributes
                status: DISABLED,
                throttleServoMotorAngle: 0,
                SteeringStepperMotorSteps: 0,
                breakingServoMotorAngle: 0
                    // functions or methods
        
            };


     // 2.3 QueryWrenchEffort : Message ID = 2405h
    //----------------------------------------------------
    // Respond with message ID : 4405h => ReportWrenchEffort
    socket.on('2405h', (nodeInfo) => {
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Wrench Effort received  from ${nodeInfo.sender.name}!`);
        console.log(`\null => sending Wrench Effort data to ${nodeInfo.sender.name}...`);

        // get Global Pose data from hardware. Here we use dummy data    
        var wrenchEffort = {
            PresenceVector: 1, // Boolean 1 or 0
            PropulsiveLinearEffortX: 0, // Percentage (0 to 100)
            PropulsiveLinearEffortY: 0, // Percentage (0 to 100)
            PropulsiveLinearEffortZ: 0, // Percentage (0 to 100)
            PropulsiveRotationalEffortX: 0, // Percentage (0 to 100)
            PropulsiveRotationalEffortY: 0, // Percentage (0 to 100)
            PropulsiveRotationalEffortZ: 0, // Percentage (0 to 100)
            ResistiveLinearEffortX: 0, // Percentage (0 to 100)
            ResistiveLinearEffortY: 0, // Percentage (0 to 100)
            ResistiveLinearEffortZ: 0, // Percentage (0 to 100)
            ResistiveRotationalEffortY: 0, // Percentage (0 to 100)
            ResistiveRotationalEffortZ: 0 // Percentage (0 to 100)

        };
                    // 3.3 primitiveDriver methods 
            //----------------------------
        primitiveDriver.reportWrenchEffort = function() {
            var result = FAILED;
            var currentWrenchEffortJSON = JSON.stringify(this.wrenchEffort);
            console.log('\n\n =>  Sending Wrench Effort :\n\n');
            io.emit('reportWrenchEffort', currentWrenchEffortJSON);
            //console.log(currentWrenchEffort);
            return SUCCESS;
        }
        primitiveDriver.setWrenchEffort = function(wrenchEffort) {
            var result = SUCCESS;

            // first try to set it in the hardware and read the values from the sensors
            // do it with a timeout async functions  and ORing the result variable with the result
            // of each parameter. if all are successful the end result will be SUCCESS.
            /*********************************************************************************** */

            //put that code here or call that function here;

            // Then update the parameter with the ones measured from the sensors (feedback) 
            /*******************************************************************************
            *  */
            this.wrenchEffort.PresenceVector = primitiveDriver.wrenchEffort.PresenceVector;
            this.wrenchEffort.PropulsiveLinearEffortX = wrenchEffort.PropulsiveLinearEffortX;
            this.wrenchEffort.PropulsiveLinearEffortY = wrenchEffort.PropulsiveLinearEffortY;
            this.wrenchEffort.PropulsiveLinearEffortZ = wrenchEffort.PropulsiveLinearEffortZ;
            this.wrenchEffort.PropulsiveRotationalEffortX = wrenchEffort.PropulsiveRotationalEffortX;
            this.wrenchEffort.PropulsiveRotationalEffortY = wrenchEffort.PropulsiveRotationalEffortY;
            this.wrenchEffort.PropulsiveRotationalEffortZ = wrenchEffort.PropulsiveRotationalEffortZ;
            this.wrenchEffort.ResistiveLinearEffortX = wrenchEffort.ResistiveLinearEffortX;
            this.wrenchEffort.ResistiveLinearEffortY = wrenchEffort.ResistiveLinearEffortY;
            this.wrenchEffort.ResistiveLinearEffortZ = wrenchEffort.ResistiveLinearEffortZ;
            this.wrenchEffort.ResistiveRotationalEffortY = wrenchEffort.ResistiveRotationalEffortY;
            this.wrenchEffort.ResistiveRotationalEffortZ = wrenchEffort.ResistiveRotationalEffortZ;

            // send an acknowledgement message to the Vector driver (SUCCESS or FAILED)
            /************************************************************************** */
            io.emit('setWrenchEffortResult', result);

            // return the result of this function to the caller of the function
            /******************************************************************* */
            return result;

        }
        // 4. Handling of socket io events 
//---------------------------------

// 4.1 on Client connection
/****************************/
io.on('connection', function(client) {
    // display a message on the console
    console.log('\n\n =>Client Connected!\n\n');

    // 4.2 example of handling a message that the client has emitted ( here 'CH01') 
    /***************************************************************************/
    // This example must be replaced with Dismissed controller message handling
    client.on('test', function(from, msg) {

        console.log('Message ', from, 'saying', msg);

    });

    // Handling of the Set Wrench effort (Message ID: 0405h);
    /**********************************************************/
    client.on('setWrenchEffort', function(wrenchEffort) {

        var sW = primitiveDriver.setWrenchEffort(wrenchEffort);

        console.log(wrenchEffort);
        if (sW === SUCCESS) {
            console.log('\n\n => Setting the wrench effort was Successful!');
        } else {
            console.log('\n\n => Setting the wrench effort Failed!');
        }

    });

    // Hanling of the OCU Slider actions to set the wrench effort
    /************************************************************* */

    // response to breaks slider
    client.on('breaks', function (breaks) {
        console.log('\n\n breaks => ' + breaks + ' %');
        primitiveDriver.wrenchEffort.ResistiveLinearEffortX = breaks;
    });

    // response to speed slider
    client.on('speed', function (speed) {
        console.log('\n\n speed => ' + speed + ' %');
        primitiveDriver.wrenchEffort.PropulsiveLinearEffortX = speed;
    });

    // response to direction slider
    client.on('dir', function (dir) {
        console.log('\n\n Heading => ' + dir + ' degrees');
        primitiveDriver.wrenchEffort.PropulsiveRotationalEffortZ= dir;
    });

    // Handling of the Query Wrench effort (Message ID: 2405h )
    /**********************************************************/
    //client.on('queryWrenchEffort', primitiveDriver.reportWrenchEffort());
    client.on('queryWrenchEffort', function() {
         primitiveDriver.reportWrenchEffort();
    });
    client.on('disconnect', function() {

        // body... 

    });


});
        // Dismiss Controller
        primitiveDriver.dismissController = function() {
            var result;

        }
        
        // Format the packet to send  
        nodeInfo.messageID = '4405h';
        nodeInfo.data = wrenchEffort;
        nodeInfo.sequenceNo = 1;
        // send the response -> this block of code must be in a function   
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        socket.emit(nodeInfo.messageID, nodeInfo, (ack) => { //socket io emit block
        if (ack.recipient === 'undefined') {
                console.log('recipient node did not respond!');
            } else {

                console.log('\n\n => ack :->  ', JSON.stringify(ack, null, 4));
            }
        });//end of socket io emit block
    });

 });

 // load all the mission from that mongoDB database

 $.getJSON('/ocu/missions',function(missions){
    //get all the missions
    console.log('Missions',missions);
    var mission_names = [];
    missions.forEach(function(Amission){
      mission_names.push(Amission.name);
    });
    mission_names.sort(); // sort all missions by name
    console.log('All Missions created ...', mission_names);

     var list_of_missions = '<option selected="selected" value= "0">-select Mission -</option> ';
    // add all the missions to the dropdownlist
    for(i =0 ; i< mission_names.length;i++){
      list_of_missions+= "<option value='"+ i + "'>" + mission_names[i] + "</option>"
    }
     // render to gui
      $('#mission_name').html(list_of_missions)

 })
 

  // create a mission saves all the results on the database


 // =====================================================================================
 //              Load Mission to the World Model Spooler
 //======================================================================================
 // Send the command  on button click to the system commander and it must save it to the
 // mongo dB

 $('#start_mission').bind('click', function() {
    console.log('mission starting');
     // load missionInfo
     // get the selected Missiion then call it from the db
     var selectedMission = $('#mission_name option:selected').text();
     console.log('Selected mission ', selectedMission);
     // ideally we would want to get the mission by its ID : CONSTAINT ALL MISSION BY NAME
     $.getJSON('/ocu/getMissionByName/'+selectedMission,function(missionDataInfo){
        console.log('missionInfo',missionDataInfo);
        // populate the JSON to be sent via the socket.IO

        var missionInfo = {
           from: 'OCU',
           to: 'Mission Spooler',
           id: missionDataInfo[0]._id, // get missionId from mongoDB
           name: missionDataInfo[0].name,
           description: missionDataInfo[0].description,
           location:{
               x: 1,
               y:-1,
               r: 4.5
           },
           destination: {
               x: 8,
               y: -13,
               r: 2.5
           },
           speed:11.5,
           map: {
               rows: 16,
               columns: 16,
               gridSize: 32.2,
               traversability: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1],
                [1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,1,0,1,1,0,0,0,0,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,1,0,1,1,0,0,0,0,0,0,0,1],
                [1,0,0,1,0,0,0,0,0,1,1,1,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,1,0,0,1,1,0,0,0,0,0,1,1,1,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1,0,0,1],
                [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1],
                [1,0,0,1,0,0,0,0,1,1,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ]
           }

       };
       var nodeInfo = {
           messageID: '0E00h',
           sender: me,
           recipient: missionSpooler,
           data: missionInfo,
           sequenceNo: 1
       };
       console.log('missionInfo',missionInfo);
       socket.emit('0E00h', nodeInfo, (ack) => {
           if (ack.recipient === 'undefined') {
               console.log('recipient node did not respond!');
           } else {
               // 3.5 getting the acknowledgement and logging it to console
               console.log('\n\n ack :->  ', JSON.stringify(ack, null, 4));
           }
       });


     })
 })
 $('#postMission').bind('click', function() {
   var missionData  = {
     'name':document.getElementById('name').value,
     'description':document.getElementById('description').value,
     'image':document.getElementById('image').file[0]
   }
   console.log('missionData Object', missionData.name);
    $.post('/create/missions/',missionData);
     window.location.replace("/");
    alert('Mission Created', missionData.name)

   // Example of map info
   // Must be read from file (JSON) converted from a Google image
   // Question : How to upload a JPEG file using socket.io?
    /*
   console.log('Load the mission info => ', JSON.stringify(nodeInfo.data, null, 4));
   // scoket
   */
    // At this point we just creating a new mission
    console.log('creating a Mission ...');

    //


 });


 // =====================================================================================
 //             Start the  Mission
 //======================================================================================
 // Send the command  on button click to the system commander and it must retreave the correct
 // mission from Mong DB and start the waterfall from driving . if mission id is not given  get
 //mission from the last save mission in  mongo dB

 $('#start').bind('click', function() {
     var nodeInfo = {
         messageID: '0E01h',
         sender: me,
         recipient: missionSpooler,
         data: {
             id: 001,
             name: 'Battle of Troy' // crete a mission
         },
         sequenceNo: 1
     }
     console.log('starting the mission...');
     socket.emit('0E01h', nodeInfo);
 })

 $('#stop').bind('click', function() {
    var selectedMission = $('#mission_name option:selected').text();
     var nodeInfo = {
         messageID: '0E02h',
         sender: me,
         recipient: missionSpooler,
         data: {
             id: 001,
             name: selectedMission
         },
         sequenceNo: 1
     }
     console.log('stop the mission');
     socket.emit('0E02h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    }); 
      })

 // =====================================================================================
 //             Pause  the  Mission
 //======================================================================================
 // Send the command  on button click to the system commander and it mustretreave the correct
 // mission from Mong DB and start the waterfall from driving
 // mongo dB

 $('#pause').bind('click', function(e) {
    var selectedMission = $('#mission_name option:selected').text();
     var nodeInfo = {
         messageID: '0E03h',
         sender: me,
         recipient: missionSpooler,
         data: {
             id: 001,
             name: selectedMission
         },
         sequenceNo: 1
     }
     console.log('pause the mission', e.timeStamp);
     socket.emit('0E03h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
     })

 $('#resume').bind('click', function() {
    var selectedMission = $('#mission_name option:selected').text();
     var nodeInfo = {
         messageID: '0E04h',
         sender: me,
         recipient: missionSpooler,
         data: {
             id: 001,
             name: selectedMission
         },
         sequenceNo: 1
     }
     console.log('resume the mission');
     socket.emit('0E04h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
})

 $('#manual').bind('click', function() {
     var nodeInfo = {
         messageID: '0E06h',
         sender: me,
         recipient: subSystemCommander,
         data: 'Manual',
         sequenceNo: 1
     }
     console.log('manual the mission');
     socket.emit('0E06h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
})
// Local Primitive Driver
socket.on('messages', function(data) {
    alert(data);
});
// Function to handle the sliders's actions
//------------------------------------------
function updateBreaks(effort) {
    document.querySelector('#breakEffort').value = effort;
     socket.emit('breaks', effort );
}

function updateSpeed(effort) {
    document.querySelector('#speedEffort').value = effort;
      socket.emit('speed', effort );
}

function updateDirection(effort) {
    document.querySelector('#dirEffort').value = effort;
      socket.emit('dir', effort );
}


var map;

    function initialize() {
        var myLatlng = new google.maps.LatLng(40.713956, -74.006653);

        var myOptions = {
            zoom: 8,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("mapp"), myOptions);

        var marker = new google.maps.Marker({
            draggable: true,
            position: myLatlng,
            map: map
        });

        google.maps.event.addListener(marker, 'dragend', function (event) {


            document.getElementById("lat").value = event.latLng.lat();
            document.getElementById("long").value = event.latLng.lng();
        });
        
        google.maps.event.addListener(map, 'click', function (event) {


            document.getElementById("lat").value = event.latLng.lat();
            document.getElementById("long").value = event.latLng.lng();
        });
    }
google.maps.event.addDomListener(window, "load", initialize);