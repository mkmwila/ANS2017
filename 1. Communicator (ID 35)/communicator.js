/*  File : jaus-communicator.js
   ==========================================================================
	Component ID = 35

	The Communicator component maintains all data links to other subsystems 
  within a system. The communicator component allows for a single point of entry 
  to any subsystem 

	It is implemented in Node.js as a socket-io server with socket clients being
  the other subsystem components. It also include  as a webserver using 
  with the client running in a browser at the OCU tablet.

  Author : Martin K. Mwila
	Title  : Senior Electronic Engineer.
    Company : CSIR - DPSS - Landward Sciences
    Project : G-Bat Autonomous Navigation System
    Date  : 26-Dec-2016
    ==========================================================================*/
// 1. Binding the socket -io to an http server 
//----------------------------------------------

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const moment = require('moment');
const async = require('async');

const PORT = 3000;

var SysComTime = moment().valueOf();

var me = {
    id: 35,
    name: 'JAUS Communicator ',
    regstrationTime: SysComTime,
    socketID: 0
};

var systemTree = [me];

var sendTo = [{}];

// Functions prototypes used by Communicator
//-------------------------------------------
//
// a) Forwarding the command  from sender to recepient. 
//------------------------------------------------------
function relaydMessages(senderNodeInfo, socket, ack) {
    async.waterfall([
        // 1. checking if recipient is still connected  
        // and retrieve the socket.io to be passed to next waterfall function
        (callback) => {
            //console.log("Checking Recipient....\n\n");
            var sentTo = systemTree.filter((node) => {
                return node.name === senderNodeInfo.recipient.name;
            });
            try {
                var destNodeInfo = sentTo[0].socketID;
                callback(null, destNodeInfo);
            } catch (err) {
                console.log(`${senderNodeInfo.recipient.name} is not connected to the G - Bat Network!`);
            }
        },
        //2 Format the message and send abd wait for acknowledgement
        (destNodeInfo, callback) => {
            // console.log("Sending Message....\n\n");
            socket.broadcast.to(destNodeInfo).emit(senderNodeInfo.messageID, senderNodeInfo);
            callback(null, destNodeInfo)
        }
    ], (err, result) => {
        if (err) {

            console.log("Communication error");
            ack.status = 'Error';
        } else {
            ack.status = 'OK';
            ack.recipient = senderNodeInfo.recipient.name;
            ack.sender = senderNodeInfo.sender.name;
            ack.sequence = senderNodeInfo.sequence;
            ack.timestamp = moment().valueOf();
        }
    });
    return (ack);
}


// 3. start the server ,listen on port 3000 and display a message to interact with user
server.listen(PORT, () => {
    console.log('\n\n**** G-Bat JAUS Communicator running on port ' + PORT + ' ****');
});


// JAUS Socket io messaging
/****************************/
// Acknowledgemets callbacks are inplemented where possible to give feedback of the
// communication status

//==========================================================================================
//                        1. Connection and registration
//==========================================================================================

io.on('connection', (socket) => { // socket io connection
    // register the nodeInfo ID on the tree of connected nodeInfos and make it join a roomnamed after
    // its nodeInfo ID
    var connectingNodeInfo = {};
    var timeNow = moment().valueOf();
    socket.emit('register', { from: me, timeStamp: timeNow }, (nodeInfo) => {
        connectingNodeInfo.regstrationTime = timeNow;
        connectingNodeInfo.id = nodeInfo.id;
        connectingNodeInfo.name = nodeInfo.name;
        connectingNodeInfo.socketID = socket.id;
        systemTree.push(connectingNodeInfo);
        socket.join((nodeInfo.id).toString());
        console.log(`\n\n => ${nodeInfo.name} has Connected to the G-Bat Nework!\n\n `);
        console.log('\n\n => Updated System Tree : ', JSON.stringify(systemTree, null, 4));

        socket.broadcast.emit('registration', connectingNodeInfo);
        io.emit('systemUpdate', systemTree);

    });


    //==========================================================================================
    //                                  1. Management services
    ///=========================================================================================
    // 1.1 SetAuthority : Message ID = 0001h
    //----------------------------------------
    socket.on('0001h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name}is Setting Authority on ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0001h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    // 1.2 Shutdown : Message ID = 0002h
    //-----------------------------------
    socket.on('0002h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Shutting down the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0002h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.3 Standby : Message ID = 0003h
    //-----------------------------------
    socket.on('0003h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Sending a Standby command to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0003h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.4 Resume : Message ID = 0004h
    //-----------------------------------
    socket.on('0004h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Sending a Resume command to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0004h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.5 Reset : Message ID = 0005h
    //-----------------------------------------
    socket.on('0005h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Sending a Reset command to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0005h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.6 SetEmergency : Message ID = 0006h
    //-----------------------------------------
    socket.on('0006h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting an Emergengy situation in the ${nodeInfo.recipient.name} `);
        var ack = {
            command: '0006h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.7 ClearEmergency : Message ID = 0007h
    //-----------------------------------------
    socket.on('0007h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is clearing the emergency situation set in the ${nodeInfo.recipient.name} `);
        var ack = {
            command: '0007h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.8 SetTime : Message ID = 0011h
    //-----------------------------------------
    socket.on('0011h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the time of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0011h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    // 1.9 QueryStatus : Message ID = 2002h
    //-----------------------------------------
    socket.on('2002h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is quering the Status of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2002h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.10 QueryHeartbeatPulse : Message ID = 2202h
    //-----------------------------------------
    socket.on('2202h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the HeartBeat Pulse of ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2202h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.11 QueryTime : Message ID = 2011h
    //-----------------------------------------
    socket.on('2011h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the time from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2011h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.12 ReportStatus : Message ID = 4002h
    //-----------------------------------------
    socket.on('4002h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting its status to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4202h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.13 ReportHeartbeatPulse : Message ID = 4202h
    //------------------------------------------------
    socket.on('4202h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting its HeartBeat Pulse to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4202h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.14 ReportTime : Message ID = 4011h
    //-----------------------------------------
    socket.on('4011h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting its Time to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4011h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 1.15 Acknowledgement : Message ID = 4400h
    //-----------------------------------------------------
    socket.on('4400h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is sending an Acknowledgement ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4E00h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    //==========================================================================================
    //                          2. Global Pose Sensor services
    //==========================================================================================
    // 2.1 SetGlobalPose : Message ID = 0402h
    //---------------------------------------
    socket.on('0402h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is setting the Global Pose of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4202h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 2.2 SetGeomagneticProperty : Message ID = 0412h
    //---------------------------------------------------
    socket.on('0412h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Geomagnetic Property of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0412h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 2.4 QueryGlobalPose : Message ID = 2402h
    //------------------------------------------
    socket.on('2402h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Global Pose from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2402h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 2.5 QueryGeomagneticProperty : Message ID = 2412h
    //---------------------------------------------------
    socket.on('2412h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Geomagnetic Property from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2412h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 2.6 ReportGlobalPose : Message ID = 4402h
    //-------------------------------------------
    socket.on('4402h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is reporting Global pose to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4402h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 2.7 ReportGeomagneticProperty : Message ID = 4412h
    //----------------------------------------------------
    socket.on('4412h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} Reporting Geomagnetic Property to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4412h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    //==========================================================================================
    //                           3. Local Pose Sensor services
    //==========================================================================================
    // 3.1 SetLocalPose : Message ID = 0403h
    //---------------------------------------
    socket.on('0403h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is setting the Local Pose of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0403h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 3.2 QueryLocalPose : Message ID = 2403h
    //------------------------------------------
    socket.on('2403h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Local Pose from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2403h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 2.6 ReportLocalPose : Message ID = 4403h
    //-------------------------------------------
    socket.on('4403h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is reporting Local pose to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4403h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });
    //=========================================================================================
    //                            4. All Drivers ( Common services)
    //=========================================================================================
    // 4.1 SetTravelSpeed : Message ID = 040Ah
    //------------------------------------------
    socket.on('040Ah', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Travel Speed of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '040Ah'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 4.2 ExecuteList : Message ID = 041Eh
    //--------------------------------------
    socket.on('041Eh', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is sending Execute List to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '041Eh'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 4.3 QueryTravelSpeed : Message ID = 240Ah
    //--------------------------------------------
    socket.on('240Ah', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Travel Speed of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '240Ah'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
        clearTimeout(nack);
    });

    // 4.4 ReportTravelSpeed : Message ID = 440Ah
    //--------------------------------------------
    socket.on('440Ah', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Travel Speed to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '440Ah'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                              5. Primitive Driver services
    //==========================================================================================
    // 5.1 SetWrenchEffort : Message ID = 0405h
    //------------------------------------------
    socket.on('0405h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Wrench Effort of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0405h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 5.2 QueryWrenchEffort : Message ID = 2405h
    //------------------------------------------
    socket.on('2405h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Wrench Effort from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2405h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 5.3 ReportWrenchEffort : Message ID = 4405h
    //------------------------------------------
    socket.on('4405h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Wrench Effort to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4405h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                               6. Global Vector Driver services
    //==========================================================================================
    //6.1 SetGlobalVector : Message ID = 0407h
    //------------------------------------------
    socket.on('0407h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Global Vector in to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0407h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 6.2 QueryGlobalVector : Message ID = 2407h
    //------------------------------------------
    socket.on('2407h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Global Vector from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2407h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    // 6.3 ReportGlobalVector : Message ID = 4407h
    //------------------------------------------
    socket.on('4407h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Global Vector to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4407h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                              7. Local Vector Driver services
    //==========================================================================================
    // 7.1 SetLocalVector : Message ID = 0408h
    //------------------------------------------
    socket.on('0408h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Local Vector in to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0408h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 7.2 QueryLocalVector : Message ID = 2408h
    //--------------------------------------------
    socket.on('2408h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Localal Vector from the ${nodeInfo.recipient.name}`);

        var ack = {
            command: '2408h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 7.3 ReportLocalVector : Message ID = 4408h
    //------------------------------------------
    socket.on('4408h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Local Vector to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4408h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    //==========================================================================================
    //                               8. Global Waypoint Driver services
    //==========================================================================================
    // 8.1 SetGlobalWaypoint : Message ID = 040Ch
    //---------------------------------------------
    socket.on('040Ch', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Global Waypoint of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '040Ch'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 8.2 QueryGlobalWaypoint : Message ID = 240Ch
    //------------------------------------------
    socket.on('240Ch', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name}  is Querying the Global Waypoint from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '240Ch'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 8.3 ReportGlobalWaypoint : Message ID = 440Ch
    //-----------------------------------------------
    socket.on('440Ch', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Global Waypoint to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '440Ch'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                               9. Local Waypoint Driver services
    //==========================================================================================
    // 9.1 SetLocalWaypoint : Message ID = 040Dh
    //---------------------------------------------
    socket.on('040Dh', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Local Waypoint of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '040Dh'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 9.2 QueryLocalWaypoint : Message ID = 240Dh
    //------------------------------------------
    socket.on('240Dh', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Local Waypoint from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '240Dh'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 9.3 ReportLocalWaypoint : Message ID = 440Dh
    //------------------------------------------
    socket.on('440Dh', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Local Waypoint to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '440Dh'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                           10. Local Path Segment Driver services
    //==========================================================================================


    //==========================================================================================
    //                              11. Velocity State Sensor services
    //==========================================================================================
    // 11.1 QueryVelocityState : Message ID = 2404h
    //----------------------------------------------
    socket.on('2404h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Velocity state of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2404h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 11.2 ReportVelocityState : Message ID = 4404h
    //----------------------------------------------
    socket.on('4404h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Velocity state to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4404h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                          12. Acceleration State Sensor services
    //==========================================================================================

    // 11.2 QueryAccelerationState : Message ID = 2417h
    //----------------------------------------------
    socket.on('2417h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Acceleration state of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2417h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 12.2 ReportAccelerationState : Message ID = 4417h
    //----------------------------------------------
    socket.on('4417h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Acceleration state to the ${nodeInfo.recipient.name}`);

        var ack = {
            command: '4417h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                                 13. Illumination services
    //==========================================================================================

    // 13.1 SetIlluminationState : Message ID = 0513h
    //------------------------------------------------
    socket.on('0513h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting the Illumination state of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0513h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 13.2 QueryIlluminationState : Message ID = 2513h
    //---------------------------------------------------
    socket.on('2513h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Illumination state of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2513h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 13.3 QueryIlluminationConfiguration : Message ID = 2514h
    //-----------------------------------------------------------
    socket.on('2514h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Illumination Configuration of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2514h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 13.4 ReportIlluminationState : Message ID = 4513h
    //----------------------------------------------------
    socket.on('4513h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Illumination state to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4513h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 13.5 ReportIlluminationConfiguration : Message ID = 4514h
    //-----------------------------------------------------------
    socket.on('4514h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Illumination Configuration to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4514h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                                  14. Odometer services
    //==========================================================================================
    // 14.1 ResetOdometry : Message ID = 0515h
    //---------------------------------------------
    socket.on('0515h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Resetting the Odometry of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0515h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 14.2 QueryOdometer : Message ID = 2515h
    //---------------------------------------------
    socket.on('2515h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying the Odometry of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2515h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 14.3 ReportOdometer : Message ID = 4515h
    //---------------------------------------------
    socket.on('4515h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Odometry to the ${nodeInfo.recipient.name}`);

        var ack = {
            command: '4515h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                                  15. Visual Sensor services
    //==========================================================================================
    // 15.1 ConfirmSensorConfiguration : Message ID = 0801h
    //-----------------------------------------------------
    socket.on('0801h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Confirming the sensor configuration of the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0801h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 15.2 QueryStillImageData : Message ID = 2814h
    //-----------------------------------------------------
    socket.on('2814h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Still Image from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2814h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 15.2 ReportStillImageData : Message ID = 4814h
    //-----------------------------------------------------
    socket.on('4814h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Still Image to the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4814h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                                  16. Range Sensor services
    //==========================================================================================
    // 16.1 SetRangeSensorCofiguration : Message ID = 0802h
    //-----------------------------------------------------
    socket.on('0802h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting Range Sensor Configuration on the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0802h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.2 QueryRangeSensorCapabilities : Message ID = 2801h
    //-----------------------------------------------------
    socket.on('2801h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Range Sensor Capability of ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2801h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.3 QueryRangeSensorConfiguration : Message ID = 2802h
    //-----------------------------------------------------
    socket.on('2802h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Range Sensor Configuration of ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2802h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.4 QueryRangeSensorData : Message ID = 2803h
    //-----------------------------------------------------
    socket.on('2803h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Range Sensor Data of ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2803h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.5 QueryRangeSensorCompressedData : Message ID = 2804h
    //-----------------------------------------------------
    socket.on('2804h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Range Sensor Compressed Data of ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2804h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.6 ReportRangeSensorCapabilities : Message ID = 4801h
    //-----------------------------------------------------
    socket.on('4801h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting the Range Sensor Capability to${nodeInfo.recipient.name}`);
        var ack = {
            command: '4801h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.7 ReportRangeSensorConfiguration : Message ID = 4802h
    //-----------------------------------------------------
    socket.on('4802h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Range Sensor Configuration to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4802h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.8 ReportRangeSensorData : Message ID = 4803h
    //-----------------------------------------------------
    socket.on('4803h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Range Sensor Data to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4803h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 16.9 ReportRangeSensorCompressedData : Message ID = 4804h
    //-----------------------------------------------------------
    socket.on('4804h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Range Sensor Compressed Data to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4804h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                          17.Knowledge Vector Store Services
    //==========================================================================================
    // 17.1 Set Vector Knowledge Store Feature Class Metadata:: Message ID : 0A21h
    //---------------------------------------------------------------------------
    socket.on('0A20h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Setting Vector Knowledge Store Feature Class Metadata of ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0A20h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 17.2 Create Vector Knowledge Store 0bject: Message ID : 0A21h
    //--------------------------------------------------------------
    socket.on('0A21h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Creating Vector Knowledge Store 0b ject in ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0A21h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 17.3 Delete Vector Knowledge Store 0bject: Message ID : 0A24h
    //--------------------------------------------------------------
    socket.on('0A24h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Deleting Vector Knowledge Store 0b ject in ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0A24'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 17.4 Query Vector Knowledge Store Feature class metadata: Message ID : 2A21h
    //-----------------------------------------------------------------------------
    socket.on('2A21h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Vector Knowledge Store Feature class metadata from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2A21h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    // 17.5 Query Vector Knowledge Store bounds: Message ID : 2A22h
    //------------------------------------------------------------
    socket.on('2A22h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Vector Knowledge Store bounds from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2A22h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 17.6 Query Vector Knowledge Store Object : Message ID : 2A23h
    //-------------------------------------------------------------
    socket.on('2A23h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name}  is Querying Vector Knowledge Store Object from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2A23h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 17.7 Report Vector Knowledge Store Feature class metadata: Message ID : 4A21h
    //-----------------------------------------------------------------------------
    socket.on('4A21h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Vector Knowledge Store Feature class metadata to ${nodeInfo.recipient.name }`);
        var ack = {
            command: '4A21h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    //17.8 Report Vector Knowledge Store bounds: Message ID : 2A22h
    //------------------------------------------------------------
    socket.on('4A22h', (nodeInfo, acknowledge) => {
        console.log(`\  => ${nodeInfo.sender.name} is Reporting Vector Knowledge Store bounds to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4A22h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 17.9 Report Vector Knowledge Store Object : Message ID : 2A23h
    //-------------------------------------------------------------
    socket.on('4A23h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Vector Knowledge Store Object to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4A23h',
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);

    });


    //==========================================================================================
    //                                  18. Discovery services
    //==========================================================================================

    // 18.1 QueryIdentification : Message ID = 2B00h
    //-----------------------------------------------------
    socket.on('2B00h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Identification from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2B00h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.2 QueryConfiguration : Message ID = 2B01h
    //-----------------------------------------------------
    socket.on('2B01h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Configuration from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2B01h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.3 QuerySubsystemList : Message ID = 2B02h
    //-----------------------------------------------------
    socket.on('2B02h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Subsystem List from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2B02h',
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.4 QueryServices : Message ID = 2B03h
    //-----------------------------------------------------
    socket.on('2B03h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Services from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2B03h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.5 QueryServicesList : Message ID = 2B04h
    //-----------------------------------------------------
    socket.on('2B04h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying Services List from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '2B04h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.6 ReportIdentification : Message ID = 4B00h
    //-----------------------------------------------------
    socket.on('4B00h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Identification to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4B00h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.7 ReportConfiguration : Message ID = 4B01h
    //-----------------------------------------------------
    socket.on('4B01h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Configuration to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4B01h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.8 ReportSubsystemList : Message ID = 4B02h
    //-----------------------------------------------------
    socket.on('4B02h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Subsystem List to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4B02h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 18.9 ReportServices : Message ID = 4B03h
    //-----------------------------------------------------
    socket.on('4B03h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Services to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4B03h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 17.10 ReportServicesList : Message ID = 4B04h
    //-----------------------------------------------------
    socket.on('4B04h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Services List to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4804h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                              19. Mission Spooler services
    //==========================================================================================

    // 19.1 SpoolMission : Message ID = 0E00h
    //----------------------------------------
    socket.on('0E00h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Spoolling a Mission to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0E00h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.2 RunMission : Message ID = 0E01h
    //----------------------------------------
    socket.on('0E01h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is sending a Run Mission Command to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0E01h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.3 AbortMission : Message ID = 0E02h
    //----------------------------------------
    socket.on('0E02h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is sending an Abort Mssion Command to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0E02h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.4 PauseMission : Message ID = 0E03h
    //----------------------------------------
    socket.on('0E03h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is sending a Pause Mission Command to ${nodeInfo.recipient.name}               `);
        var ack = {
            command: '0E03h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.5 ResumeMission : Message ID = 0E04h
    //----------------------------------------
    socket.on('0E04h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is sending a Run Mission Command to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0E04h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.6 RemoveMessages : Message ID = 0E05h
    //----------------------------------------
    socket.on('0E05h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Removing Messages from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0E05h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.7 InsertMessages : Message ID = 0E06h
    //----------------------------------------
    socket.on('0E06h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Inserting messages in the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0E06h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.7 RemoveMissionTask : Message ID = 0E07h
    //----------------------------------------
    socket.on('0E07h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Removing Mission Task from the ${nodeInfo.recipient.name}`);
        var ack = {
            command: '0E07h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.7 InsertMissionTask : Message ID = 0E08h
    //----------------------------------------
    socket.on('0E08h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Inserting a Mission Task in ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4804h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.8 ReportSpoolingPreferences : Message ID = 4E00h
    //-----------------------------------------------------
    socket.on('4E00h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting spooling Preferences to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4E00h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.9 ReportMissionStatus : Message ID = 4E01h
    //-----------------------------------------------------
    socket.on('4E01h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Mission Status to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4E01h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.10 ReportStored : Message ID = 4E02h
    //-----------------------------------------------------
    socket.on('4E02h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Stored Missions to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4E02h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.11 ReportMissionPlan : Message ID = 4E03h
    //-----------------------------------------------------
    socket.on('4E03h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Mission Plan to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '4E03h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================
    //                             20. List Manager services
    //==========================================================================================
    // 20.1 QueryJausAddress: Message ID = 5555h
    //-----------------------------------------------------
    socket.on('5555h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Querying JAUS Address from ${nodeInfo.recipient.name}`);
        var ack = {
            command: '5555h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });

    // 19.2 ReportJausAddress: Message ID = 5556h
    //-----------------------------------------------------
    socket.on('5556h', (nodeInfo, acknowledge) => {
        console.log(`\n => ${nodeInfo.sender.name} is Reporting Jaus Address to ${nodeInfo.recipient.name}`);
        var ack = {
            command: '5556h'
        };
        var status = relaydMessages(nodeInfo, socket, ack);
        acknowledge(status);
    });


    //==========================================================================================    
    //                              21. Hanling disconnections
    //==========================================================================================
    // On disconnect, remove the nodeInfo from the connected list array => use the filter method 
    // on the nodeInfos array. 
    socket.on('disconnect', () => {
        var disconnectedNodeInfo = systemTree.filter((node) => {
            return node.socketID === socket.id;
        });

        newTree = systemTree.filter((node) => {
            return node.socketID !== socket.id;
        });
        systemTree = newTree;

        console.log(`\
                    n $ { disconnectedNodeInfo[0].name }
                    has disconnected from the G - Bat Network!`);
        console.log('\n\n => Updated System Tree', JSON.stringify(systemTree, null, 4));
        socket.broadcast.emit('deregistration', disconnectedNodeInfo[0]);
        io.sockets.emit('systemUpdate', systemTree);

    });
}); // end socket io connection


//==========================================================================================    
//                              22.Web Server handling of http Request from the OCU
//==========================================================================================

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});