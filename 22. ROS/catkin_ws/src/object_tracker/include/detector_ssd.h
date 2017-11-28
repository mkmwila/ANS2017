#ifndef CAFFE_DETECTOR_SSD
#define CAFFE_DETECTOR_SSD
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/objdetect/objdetect.hpp>


#include <algorithm>
#include <iomanip>
#include <iosfwd>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <caffe/caffe.hpp>

#include "object_detection.h"


class  Detector {
    public :
        Detector(const std::string& model_file, const std::string& trained_file,
                 const std::string& mean_file, const std::string& mean_value);
        std::vector<ObjectDetection> detect(cv::Mat& img);

        ~Detector();

    private:
        void SetMean(const std::string& mean_file, const std::string& mean_value);
        void wrapInputLayer(std::vector<cv::Mat>* input_channels);
        void preProcess(const cv::Mat& img, std::vector<cv::Mat>* input_channels);


    private:
        size_t _triggerCount;

        std::shared_ptr<caffe::Net<float>>         _net;
        cv::Size                            _input_geometry;
        int                                 _num_channels;
        cv::Mat                             _mean;
        int                                 _bicycle_id;
        int                                 _bus_id;
        int                                 _car_id;
        int                                 _motorbike_id;
        int                                 _person_id;

};



#endif      // end CAFFE_DETECTOR_SSD
