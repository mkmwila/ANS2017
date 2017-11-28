#include <ros/ros.h>
#include <geometry_msgs/Twist.h>
#include <std_msgs/String.h>
//#include <image_receiver/imInfo.h>
#include <ans_msgs/Image.h>

#include <image_transport/image_transport.h>
#include <opencv2/highgui/highgui.hpp>
#include <cv_bridge/cv_bridge.h>

#include "detector_ssd.h"
#include "tracker_kf.h"

#include <chrono>


#define fx 6.4
#define fy 3.6


// global variable
std::string node_name;
Detector* detector;
Tracker* tracker;
size_t pre_seq = 0;

ros::Publisher trac_pub;


using namespace std::chrono;

// =================================================
void rescaleDetection(std::vector<ObjectDetection> &detections)
{
    for(auto& det:detections)
    {
        det._rect.x *= fx;
        det._rect.y *= fy;
        det._rect.width *= fx;
        det._rect.height *= fy;
    }

}


// ===================================
void drawDetection(const std::vector<ObjectDetection> &detections, cv::Mat img)
{
    for(auto det:detections)
    {
        cv::Rect rect = det._rect;


        std::stringstream ss;
        if(det._classID == 0)
        {
            ss << "car: " << det._score;
            // Draw the bbox
            cv::rectangle(img, rect, cv::Scalar(0, 255, 0));
            cv::putText(img, ss.str(), cv::Point(rect.x, rect.y), cv::FONT_HERSHEY_COMPLEX_SMALL, 1, cv::Scalar::all(255), 2, 8);
        }
        else if(det._classID == 1)
        {
            ss << "person: " << det._score;
            // Draw the bbox
            cv::rectangle(img, rect, cv::Scalar(255, 0, 0));
            cv::putText(img, ss.str(), cv::Point(rect.x, rect.y), cv::FONT_HERSHEY_COMPLEX_SMALL, 1, cv::Scalar::all(255), 2, 8);
        }
        else if(det._classID == 2)
        {
            ss << "bicycle: " << det._score;
            // Draw the bbox
            cv::rectangle(img, rect, cv::Scalar(0, 0, 255));
            cv::putText(img, ss.str(), cv::Point(rect.x, rect.y), cv::FONT_HERSHEY_COMPLEX_SMALL, 1, cv::Scalar::all(255), 2, 8);
        }
        else if(det._classID == 3)
        {
            ss << "motorbike: " << det._score;
            // Draw the bbox
            cv::rectangle(img, rect, cv::Scalar(255, 255, 0));
            cv::putText(img, ss.str(), cv::Point(rect.x, rect.y), cv::FONT_HERSHEY_COMPLEX_SMALL, 1, cv::Scalar::all(255), 2, 8);
        }
        else if(det._classID == 4)
        {
            ss << "bus: " << det._score;
            // Draw the bbox
            cv::rectangle(img, rect, cv::Scalar(0, 255, 255));
            cv::putText(img, ss.str(), cv::Point(rect.x, rect.y), cv::FONT_HERSHEY_COMPLEX_SMALL, 1, cv::Scalar::all(255), 2, 8);
        }
    }
}



void publishTracks(uint32_t im_seq)
{
    std::vector<kstate> tracks;
    tracker->get_tracks(tracks);

    // publish dummy track info
    std::stringstream ss;

    ss << im_seq << " ";
    ss << tracks.size() << " ";

    for(auto & state:tracks)
    {
        ss << state.classID << " ";
        ss << state.id << " ";
        ss << state.pos.x << " " << state.pos.y << " " << 0.0 << " " << 0.0 << " ";
    }

    // message sequnce : image_sequence#, num_tracks,[for each track] classID, trackID,  tra track_x, track_y, velx, vely
    std_msgs::String msg;
    msg.data = ss.str();

    trac_pub.publish(msg);

}



//====================================
//void imageCallback(const sensor_msgs::ImageConstPtr &msg)
//void imageCallback(const image_receiver::imInfoConstPtr &msg)
void imageCallback(const ans_msgs::ImageConstPtr &msg)
{
    try
    {

        cv::Mat im = cv_bridge::toCvShare(msg->im, msg, "bgr8")->image;
        std_msgs::Header im_header = cv_bridge::toCvShare(msg->im, msg,  "bgr8")->header;

        ROS_INFO("frame number %d \n.", msg->frameNum);

         auto seq = im_header.seq;
//         pre_seq++;
//         if(seq != pre_seq)
//         {
//             ROS_INFO("Current image seq %d, num of images skipped %d", int(seq), int(seq - pre_seq));
//         }
//         pre_seq = seq;

        cv::Mat im_det;
        cv::resize(im, im_det, cv::Size(), 1/fx, 1/fy);

        // measure time it takes to do detection
        high_resolution_clock::time_point t1 = high_resolution_clock::now();
        // get detection
        std::vector<ObjectDetection> detections = detector->detect(im_det);


        // rescale detections
        rescaleDetection(detections);

        // draw detections
        drawDetection(detections, im);

        // Tracking
        bool show_tracks = true;
        auto num_track = tracker->track(im, detections, show_tracks);

        high_resolution_clock::time_point t2 = high_resolution_clock::now();

        // compute framerate based on detector and tracker
        duration<double> time_span = duration_cast<duration<double>>(t2 - t1);
        std::stringstream ss1;
        ss1 << " Framerate : " << 1/time_span.count() << " FPS.";
        cv::putText(im, ss1.str(), cv::Point(20, 120), cv::FONT_HERSHEY_COMPLEX_SMALL, 1,  cv::Scalar(255, 0, 0), 2, 8);


        //publish detections so they can send to the global map?
        publishTracks(seq);

        std::stringstream ss;
        ss << "num of tracked detections: " << num_track;
        cv::putText(im, ss.str(), cv::Point(20, 100), cv::FONT_HERSHEY_COMPLEX_SMALL, 1, cv::Scalar(255, 0, 0), 2, 8);


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
    ::google::InitGoogleLogging(argv[0]);


    ros::init(argc, argv, "object_tracker");
    ros::NodeHandle nh;
    ros::NodeHandle nhp("~");       // for parameters

    node_name = ros::this_node::getName();

    // Create a named window
    cv::namedWindow(node_name);
    cv::startWindowThread();


    // get parameters
    std::string model_file, trained_file, img_topic;
//    nhp.param("model_file", model_file, std::string("/home/terence/dev/caffeSSD/models/VGGNet/VOC0712Plus/SSD_300x300/deploy.prototxt"));
//    nhp.param("trained_file", trained_file, std::string("/home/terence/dev/caffeSSD/models/VGGNet/VOC0712Plus/SSD_300x300/VGG_VOC0712Plus_SSD_300x300_iter_240000.caffemodel"));
//    nhp.param("image_topic", img_topic, std::string("camera/image"));

    model_file = std::string("/home/terence/dev/caffeSSD/models/VGGNet/VOC0712Plus/SSD_300x300/deploy.prototxt");
    trained_file = std::string("/home/terence/dev/caffeSSD/models/VGGNet/VOC0712Plus/SSD_300x300/VGG_VOC0712Plus_SSD_300x300_iter_240000.caffemodel");
    img_topic = std::string("camera/image");

    // Initialise the detector
    detector  = new Detector(model_file, trained_file, "", "127");

    // Initialise the tracker
    tracker = new Tracker();

    // subscribe to a topic
//    image_transport::ImageTransport it(nh);
//    image_transport::Subscriber img_sub = it.subscribe(img_topic, 10, imageCallback);
      ros::Subscriber img_sub = nh.subscribe(img_topic, 10, imageCallback);


    // topic to publish tracked detections
    trac_pub = nh.advertise<std_msgs::String>("tracker/objects", 1);

    ROS_INFO("%s is running, waiting to subscribe to images topic.\n", node_name.c_str());

    // ros spin
    ros::spin();

    // destroy all the cv windows
    cv::destroyAllWindows();

    delete tracker;
    delete detector;
}
