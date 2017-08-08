from socketIO_client import SocketIO, LoggingNamespace
import json
import time

me = {
    'id': 41,
    'name': 'Local Pose Sensor'
}
systemTree = [me]

def updateSysTree(update):
    global systemTree

    systemTree = update
    print('\n => Connected Nodes:')
    print(json.dumps(systemTree, sort_keys=True, indent=4))

def on_ack(ack):
    pass
#    if ack['recipient'] is None:
#        print("Recipient node did not respond!")
#    else:
#        print("\n => ack: ")
#        print(json.dumps(ack, sort_keys=True, indent=4))

def queryLocalPose(nodeInfo):
    # This will eventually be replaced by actual data from the system
    localPoseData = {
        'Timestamp': int(time.time() * 1000),
        'x': 15,
        'y': -25,
        'r': 20.5,
        'speed': 1.3
    }

    nodeInfo['messageID'] = '4402h'
    nodeInfo['data'] = localPoseData
    nodeInfo['recipient'] = nodeInfo['sender']
    nodeInfo['sender'] = me
    nodeInfo['timeStamp'] = int(time.time() * 1000)

    global client
    client.emit(nodeInfo['messageID'], nodeInfo, on_ack)


print("\n***** Local Pose Sensor is Running! *****")

client = SocketIO('localhost', 3000, LoggingNamespace)
client.on('connect', lambda : print('\n => Connection to the G-Bat Network has been established!!\n'))
client.on('register', lambda regData, ident: ident(me))
client.on('registration', lambda regInfo: print('\n => A {} has connected to the G-Bat Network!'.format(regInfo['name'])))
client.on('deregistration', lambda regInfo: print('\n => A {} has disconnected from the G-Bat Network!'.format(regInfo['name'])))
client.on('systemUpdate', updateSysTree)
client.on('disconnect', lambda : print('Connection to the G-Bat network has been terminated!'))

client.on('2403h', queryLocalPose)
client.wait()
