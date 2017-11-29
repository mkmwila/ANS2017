#!/usr/bin/env python
import rospy
from std_msgs.msg import String
import requests


def trackInfoCallback(data):
    global ip

    data_split = data.data.split(" ")
    im_seq = data_split[0]
    num_tracks = data_split[1]
    msg = dict()
    msg['seq_num'] = im_seq
    msg['num_tracks'] = num_tracks
    for i in range(int(num_tracks)):
        idx = 2 + (i)*6
        classid = data_split[idx]
        track_x = data_split[idx+1]
        track_y = data_split[idx+2] 
        velx    = data_split[idx+3] 
        vely    = data_split[idx+4]

        # populate the track dict
        track = dict()
        track['classID'] = classid
        track['xObs'] = track_x
        track['yObs'] = track_y
        track['velX'] = velx
        track['velY'] = vely

        msg[i] = track 

    # print(msg)
#    rospy.loginfo(rospy.get_caller_id() + "ip : %s", ip)

    try:
        web_addr = "http://%s:3000/worldModel/obstacles"% ip
        res = requests.post(web_addr, data = msg, timeout=0.001)
        # TODO: check that res.status is good?
    except requests.exceptions.Timeout:
        rospy.loginfo(rospy.get_caller_id() + ' timeout error sending tracks to worldmodel')
    except:
        rospy.loginfo(rospy.get_caller_id() + " error while sending info to world map")
        



def main():
    global ip
    rospy.init_node('send_tracks_to_worldmap', anonymous=True)

    # get the parameters
    ip = rospy.get_param("/send_tracks_to_worldmap/ip")

    rospy.Subscriber('tracker/objects', String, trackInfoCallback)
    rospy.spin()

#==============================
if __name__ == '__main__':
    main()
