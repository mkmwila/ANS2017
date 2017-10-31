 //==================================================================================================================
 //                                          Connecting to the G-Bat Network
 //==================================================================================================================
 var me = {
     id: 100,
     name: 'Operator Control Unit'
 };

 var systemCommander = {
     id: 40,
     name: 'System Commander'
 };

 var systemTree = [me];


 var socket = io('http://localhost:3000'); // ip address of the G-Bat network

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
    var missionInfo = {
       from: 'OCU',
       to: 'Mission Spooler',
       id: 001, // get missionId from mongoDB
       name: 'Battle of Troy',
       destination: {
           X: 8,
           y: -13,
           r: 2.5
       },
       map: {
           rows: 16,
           columns: 16,
           gridSize: 32.2,
           traversability: {}
       }

   };
   var nodeInfo = {
       messageID: '0E00h',
       sender: me,
       recipient: systemCommander,
       data: missionInfo,
       sequenceNo: 1
   };
   socket.emit('0E00h', nodeInfo, (ack) => {
       if (ack.recipient === 'undefined') {
           console.log('recipient node did not respond!');
       } else {
           // 3.5 getting the acknowledgement and logging it to console
           console.log('\n\n ack :->  ', JSON.stringify(ack, null, 4));
       }
   });

 })
 $('#postMission').bind('click', function() {
   var missionData  = {
     'name':document.getElementById('name').value,
     'description':document.getElementById('description').value
   }
   console.log('missionData Object', missionData);
   $.post('/ocu/create/mission/',missionData);
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
         recipient: systemCommander,
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
     var nodeInfo = {
         messageID: '0E02h',
         sender: me,
         recipient: systemCommander,
         data: {
             id: 001,
             name: 'Battle of Troy'
         },
         sequenceNo: 1
     }
     console.log('stop the mission');
     socket.emit('0E02h', nodeInfo);
 })

 // =====================================================================================
 //             Pause  the  Mission
 //======================================================================================
 // Send the command  on button click to the system commander and it mustretreave the correct
 // mission from Mong DB and start the waterfall from driving
 // mongo dB

 $('#pause').bind('click', function(e) {
     var nodeInfo = {
         messageID: '0E03h',
         sender: me,
         recipient: systemCommander,
         data: {
             id: 001,
             name: 'Battle of Troy'
         },
         sequenceNo: 1
     }
     console.log('pause the mission', e.timeStamp);
     socket.emit('0E03h', nodeInfo);
 })

 $('#resume').bind('click', function() {
     var nodeInfo = {
         messageID: '0E04h',
         sender: me,
         recipient: systemCommander,
         data: {
             id: 001,
             name: 'Battle of Troy'
         },
         sequenceNo: 1
     }
     console.log('resume the mission');
     socket.emit('0E04h', nodeInfo);
 })

 $('#manual').bind('click', function() {
     var nodeInfo = {
         messageID: '0E06h',
         sender: me,
         recipient: systemCommander,
         data: 'Manual',
         sequenceNo: 1
     }
     console.log('manual the mission');
     socket.emit('0E06h', nodeInfo);
 })
