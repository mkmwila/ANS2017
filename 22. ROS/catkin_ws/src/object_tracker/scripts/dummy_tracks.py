import requests
import time


ip = "146.64.244.232"
seq = 0
num_tracks = 5

def sendDummyTracks():

    msg = {}
    msg['seq_num'] = 2
    msg['num_tracks'] = num_tracks
    
    data =  []
    for i in range(int(num_tracks)):

        classid = 0
        track_x = 10
        track_y = -2

        track = [classid, track_x, track_y]
        data.append(track)
    msg["data"] = data
    
    try:
        web_addr = "http://%s:3000/worldModel/obstacles" % ip
        res = requests.post(web_addr, data=msg, timeout=0.1)
        # TODO: check that res.status is good?
    except requests.exceptions.Timeout:
        print("request timeout")
    except:
        print(" error while sending info to world map")


def main():
    while True:
        sendDummyTracks()
        time.sleep(2)


if __name__ == "__main__":
    main()
