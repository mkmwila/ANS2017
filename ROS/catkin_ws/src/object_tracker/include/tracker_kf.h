#include "object_detection.h"

// opencv
#include <opencv2/core/core.hpp>
#include <opencv2/objdetect/objdetect.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/video/tracking.hpp>
#include <opencv2/calib3d/calib3d.hpp>

static int 			_DEFAULT_LIFESPAN = 8; //LIFESPAN of objects before stop being tracked, in frames
static int	 		_INITIAL_LIFESPAN = 4; //LIFESPAN of objects before stop being tracked, in frames
static float 		_NOISE_COV = 1;
static float 		_MEAS_NOISE_COV = 25.0f;
static float 		_ERROR_ESTIMATE_COV = 1000000.0f;
static float 		_OVERLAPPING_PERC = 0.6f;


struct kstate
{
    cv::KalmanFilter	KF;     //KalmanFilter for this object
    cv::Rect            pos;    //position of the object topLeftx, topLefty, width, height
    float               score;  //DPM score
    bool                active; //if too old (lifespan) don't use
    size_t		id;     //id of this tracked object
    int                 classID;   // tracked object type
    cv::Mat             image;  //image containing the detected and tracked object
    int                 lifespan;//remaining lifespan before deprecate
    cv::Scalar          color;
    int		real_data;           // indicate of the track has been updated with the real measurement, not just estimated
    // TODO consider adding features
};



class Tracker
{
public:
    Tracker();
    ~Tracker();

    size_t track(cv::Mat &im, std::vector<ObjectDetection> &detections, bool show_tracks=false);
    void get_tracks(std::vector<kstate> &tracks);

private:
    void doTracking(std::vector<ObjectDetection> &detections, cv::Mat &im);
    bool alreadyMatched(int check_index, std::vector<int> &matched_indices);
    void initTracking(ObjectDetection object, ObjectDetection detection, cv::Mat image);
    void ApplyNonMaximumSuppresion();
    void ApplyGroupRectactangleSuppression();

    void getRectFromPoints(std::vector<cv::Point2f> corners, cv::Rect &outBoundingBox);
    bool crossCorr(cv::Mat im1, cv::Mat im2);
    void posScaleToBbox();
    size_t getAvailableIndex();
    bool isInRemoved(std::vector<unsigned int> removedIndices, unsigned int index);
    void removeUnusedObjects();
    void Sort(const std::vector<float> in_scores, std::vector<size_t>& in_out_indices);


private:
    std::vector<kstate>             _kstates;
    std::vector<bool>               _active;
    std::vector<cv::Scalar>         _colors;
    std::vector<kstate>    _tracked_detections;
    size_t                 _next_track_id;
};
