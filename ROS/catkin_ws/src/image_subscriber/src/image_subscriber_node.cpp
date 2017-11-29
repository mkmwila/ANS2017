#include <ros/ros.h>
#include <geometry_msgs/Twist.h>
#include <std_msgs/String.h>
#include <ans_msgs/Image.h>

#include <image_transport/image_transport.h>
#include <opencv2/highgui/highgui.hpp>
#include <cv_bridge/cv_bridge.h>

std::string node_name;


void imageCallback(const ans_msgs::ImageConstPtr &msg)
{
    try
    {

        cv::Mat im = cv_bridge::toCvShare(msg->im, msg, "bgr8")->image;
        auto frameNum = msg->frameNum;
        std_msgs::Header im_header = cv_bridge::toCvShare(msg->im, msg,  "bgr8")->header;

        ROS_INFO("frame number %d \n.", frameNum);

        // show the image
        cv::Mat im_show;
        cv::resize(im, im_show, cv::Size(), 0.5, 0.5);
        cv::imshow( node_name, im_show);
        cv::waitKey(1);
    }catch (cv_bridge::Exception &e)
    {
        ROS_ERROR("Could not convert from %s to bgr8.", msg->im.encoding.c_str());
    }

}





int main(int argc, char **argv)
{
    ros::init(argc, argv, "object_tracker");
    ros::NodeHandle nh;
    ros::NodeHandle nhp("~");       // for parameters

    node_name = ros::this_node::getName();

    // Create a named window
    cv::namedWindow(node_name);
    cv::startWindowThread();

     std::string img_topic = std::string("camera/image");


    ros::Subscriber img_sub = nh.subscribe(img_topic, 10, imageCallback);

    // ros spin
    ros::spin();

    // destroy all the cv windows
    cv::destroyAllWindows();


}
