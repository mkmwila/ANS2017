#include <ros/ros.h>
#include <image_transport/image_transport.h>
#include <geometry_msgs/Twist.h>
#include <std_msgs/String.h>
#include  <ans_msgs/Image.h>


#include <opencv2/highgui/highgui.hpp>
#include <cv_bridge/cv_bridge.h>
#include <sstream>                  // for converting the command line parameter to integer

#include <stdio.h>
#include <errno.h>
#include <iostream>
#include "opencv2/opencv.hpp"


int main(int argc, char** argv)
{

  ros::init(argc, argv, "image_publisher");
  ros::NodeHandle nh;


  ros::Publisher pub = nh.advertise<ans_msgs::Image>("camera/image", 1);
//  ros::Publisher pub2 nh.advertise<sensor_msgs::Image>("/camera/image2",1);


  std::string filename("/media/terence/Data/Videos/high_way_driving_cut.mp4");
  cv::VideoCapture vidCap(filename);



    // messages
    cv::Mat frame;
    sensor_msgs::ImagePtr img_sensor;
    ans_msgs::Image msg;

    ros::Rate loop_rate(15);

    // image size
    vidCap >> frame;

   cv::Size frame_sz = frame.size();

    ROS_INFO("We are publishing images. with size %dx%d\n", frame_sz.width, frame_sz.height);

    size_t frameNum = 0;

    while (nh.ok())
    {
        vidCap >> frame;
        if (frame.empty())
        {
            ROS_INFO("image empty. break. \n");
            break;
        }

        img_sensor = cv_bridge::CvImage(std_msgs::Header(), "bgr8", frame).toImageMsg();
        msg.frameNum = frameNum;
        msg.im = *img_sensor;

        // Publish message
        pub.publish(msg);

        loop_rate.sleep();

        frameNum++;
    }
}
