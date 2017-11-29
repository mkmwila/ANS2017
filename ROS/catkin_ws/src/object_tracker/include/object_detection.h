#ifndef OBJECT_DETECTION_H
#define OBJECT_DETECTION_H

#include <opencv2/core/core.hpp>


/**
 * @brief The ObjectDetection struct
 * class ID
 *  0 - car
 *  1 - person/pedestrain
 *  2 - bicycle
 *  3 - motorbike
 *  4 - bus
 *  5 - truck
 */

struct ObjectDetection
{
    cv::Rect _rect;
    float _score;
    int _classID;
};

#endif // OBJECT_DETECTION_H
