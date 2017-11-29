#!/usr/bin/env python
import rospy
from ans_msgs.msg import Image

import cv2
from cv_bridge import CvBridge, CvBridgeError



def callback(data):
	rospy.loginfo("callback. frameNum %d"%data.frameNum)
	
	try:
		bridge = CvBridge()
		cv_image =bridge.imgmsg_to_cv2(data.im, "bgr8")

		cv2.imshow("Image", cv_image)
		cv2.waitKey(1)
	except CvBridgeError as e:
		rospy.loginfo("Error occured: %s" % e)



def listener():
    rospy.init_node('image_subscriber_pynode', anonymous=True)
    rospy.Subscriber("camera/image", Image, callback)

    # spin() simply keeps python from exiting until this node is stopped
    rospy.spin()


if __name__ == '__main__':
    listener()
