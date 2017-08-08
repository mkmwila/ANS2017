from socketIO_client import SocketIO, BaseNamespace
import threading
import time

me = {'id': 33, 'name':'Primitive Driver'}
systemTree = []
recvFlag = False

class Namespace(BaseNamespace):

    def on_connect(self, *args):
        print('connect:', args)

    def on_register(self, *args):
        print('register:', args)
        args[1](me)

    def on_registration(self, *args):
        print('registration:', args)

    def on_deregistration(self, *args):
        print('deregistration:', args)

    def on_systemUpdate(self, *args):
        global systemTree
        
        print('systemUpdate:', args)
        systemTree = args[0]
        print('System Tree', systemTree)

    def on_disconnect(self, *args):
        print('disconnect:', args)

    def on_4402h(self, *args):
#        print('Got pose data:')
#        print(args[0]['data'])

        global recvFlag
        recvFlag = True

def on_ack(*args):
#    print('Ack:', args)
    pass

sio = SocketIO('localhost', 3000, Namespace)
t = threading.Thread(target=sio.wait)
t.daemon = True
t.start()
time.sleep(1)

print("Requesting pose")
destNode = [x for x in systemTree if x['id'] == 41]
if len(destNode) is 0:
    print('Destination node is not connected')

else:
    print("Performing batch speed test...")

    nodeInfo= {
        'messageID': '2403h',
        'sender': me,
        'recipient': destNode[0],
        'data': {},
        'sequenceNo': 1
    }

    startTime = time.time()
    for i in range(1000):
        recvFlag = False
        sio.emit(nodeInfo['messageID'], nodeInfo, on_ack)
        while recvFlag is False:
            time.sleep(0.001)
    runTime = time.time() - startTime

    print("Test took {}seconds to perform 1000 iterations".format(runTime))


