#include "tracker_kf.h"

//=========
Tracker::Tracker():
    _next_track_id(0)
{
}

//============
Tracker::~Tracker()
{
}


//===========
size_t Tracker::track(cv::Mat &im, std::vector<ObjectDetection> &detections, bool show_tracks)
{
    doTracking(detections, im);

    if(show_tracks)
    {
        for(auto &state:_tracked_detections)
        {
            cv::rectangle(im, state.pos, cv::Scalar(0, 0, 255));
        }
    }

    return _tracked_detections.size();
}


// =============================
void Tracker::get_tracks(std::vector<kstate> &tracks)
{
    tracks.clear();
    for (auto state:_tracked_detections)
    {
        tracks.push_back(state);
    }
}


//==============
void Tracker::doTracking(std::vector<ObjectDetection> &detections, cv::Mat& image)
{
    std::vector<ObjectDetection> objects;
    objects = detections;

    std::vector<bool> correct_indices;              //this will correspond to kstates i
    std::vector<int> correct_detection_indices;     //this will correspond to kstates i, used to store the index of the corresponding object
    std::vector<bool> add_as_new_indices;           //this will correspond to detections j

    correct_indices.assign(_kstates.size(), false);             //correct only those matched
    correct_detection_indices.assign(_kstates.size(), -1);      //correct only those matched
    add_as_new_indices.assign(detections.size(), true);         //if the detection was not found add as new

    std::vector<int> already_matched;

    // compare detections from this frame with tracked objects
    for(size_t j = 0; j < detections.size(); j++)
    {
        for(size_t i = 0; i < _kstates.size(); i++)
        {
            // j -  detection
            // i - track
            if(_kstates[i].active)
            {
                //extend the roi 20%
                int new_x = (detections[j]._rect.x - detections[j]._rect.width*0.1);
                int new_y = (detections[j]._rect.y - detections[j]._rect.height*0.1);

                new_x = new_x < 0 ? 0 : new_x;
                new_x = new_x > image.cols ? image.cols : new_x;
                new_y = new_y < 0 ? 0 : new_y;
                new_y = new_y > image.rows ? image.rows : new_y;

                int new_width = detections[j]._rect.width*1.2;
                int new_height = detections[j]._rect.height*1.2;

                if (new_width  + new_x > image.cols)	new_width  = image.cols - new_x;
                if (new_height + new_y > image.rows)	new_height = image.rows - new_y;

                cv::Rect roi(new_x, new_y, new_width, new_height);
                cv::Mat currentObjectRIO = image(roi).clone();

                // match the 20% enlarged RIO detection to tracks
                // TODO: check that the matched currentObjectRIO is closer track RIO
                bool matched = (!alreadyMatched(j, already_matched) && crossCorr(_kstates[i].image, currentObjectRIO));

                if(matched)
                {
                    // TODO: check for possibilities of assigning two detetions to one track.
                    // TODO: check that the classID is the same
                    correct_indices[i] = true;
                    correct_detection_indices[i] = j;
                    add_as_new_indices[j] = false;
                    _kstates[i].score = detections[j]._score;

                    already_matched.push_back(j);
                }
            }
        }
    }

    // do prediction and correction for marked states
    for(size_t i = 0; i < _kstates.size(); i++)
    {
        if(_kstates[i].active) // predict and correct only active states
        {
            // update params before predicting
            cv::setIdentity(_kstates[i].KF.measurementMatrix);
            cv::setIdentity(_kstates[i].KF.processNoiseCov, cv::Scalar::all(_NOISE_COV));//1e-4
            cv::setIdentity(_kstates[i].KF.measurementNoiseCov, cv::Scalar::all(_MEAS_NOISE_COV));//1e-3
            cv::setIdentity(_kstates[i].KF.errorCovPost, cv::Scalar::all(_ERROR_ESTIMATE_COV));//100

            cv::Mat prediction = _kstates[i].KF.predict();
            cv::Mat correction;
            _kstates[i].pos.x = prediction.at<float>(0);
            _kstates[i].pos.y = prediction.at<float>(1);
            _kstates[i].pos.width = prediction.at<float>(2);
            _kstates[i].pos.height = prediction.at<float>(3);
            _kstates[i].real_data = 0;

            //now do respective corrections on KFs (updates)
            if (correct_indices[i])
            {
                //a match was found hence update KF measurement
                int j = correct_detection_indices[i];//obtain the index of the detection

                cv::Mat_<float> measurement = (cv::Mat_<float>(4, 1) << objects[j]._rect.x,
                                                                        objects[j]._rect.y,
                                                                        objects[j]._rect.width,
                                                                        objects[j]._rect.height);

                correction = _kstates[i].KF.correct(measurement);//UPDATE KF with new info
                _kstates[i].lifespan = _DEFAULT_LIFESPAN; //RESET Lifespan of object

                //use real data instead of predicted if set
                _kstates[i].pos.x = objects[j]._rect.x;
                _kstates[i].pos.y = objects[j]._rect.y;
                _kstates[i].pos.width = objects[j]._rect.width;
                _kstates[i].pos.height = objects[j]._rect.height;
                _kstates[i].real_data = 1;
            }

            //check that new widths and heights don't go beyond the image size
            if (_kstates[i].pos.width + _kstates[i].pos.x > image.cols)
                _kstates[i].pos.width = image.cols - _kstates[i].pos.x;
            if (_kstates[i].pos.height + _kstates[i].pos.y > image.rows)
                _kstates[i].pos.height = image.rows - _kstates[i].pos.y;

            //check that predicted positions are inside the image
            if (_kstates[i].pos.x < 0)
                _kstates[i].pos.x = 0;
            if (_kstates[i].pos.x > image.cols)
                _kstates[i].pos.x = image.cols;
            if (_kstates[i].pos.y < 0)
                _kstates[i].pos.y = 0;
            if (_kstates[i].pos.y > image.rows)
                _kstates[i].pos.y = image.rows;

            //remove those where the dimensions of are unlikely to be real
            if (_kstates[i].pos.width > _kstates[i].pos.height*5)
                _kstates[i].active = false;

            if (_kstates[i].pos.height > _kstates[i].pos.width*3)
                _kstates[i].active = false;

            _kstates[i].lifespan--;//reduce lifespan
            if (_kstates[i].lifespan <= 0)
            {
                _kstates[i].active = false; //Too old, stop tracking.
            }
        }
    }

    // finally add non matched detections as new
    for(auto i = 0; i < add_as_new_indices.size(); i++)
    {
        if(add_as_new_indices[i])
        {
            initTracking(objects[i], detections[i], image);
        }
    }

    // based on overlap
    ApplyNonMaximumSuppresion();

    // remove inactive object
    removeUnusedObjects();

    posScaleToBbox();
}



//================
/**
 * @brief Tracker::alreadyMatched check if check_index in already in the matched_indices list.
 * @param check_index
 * @param matched_indices
 * @return
 */
bool Tracker::alreadyMatched(int check_index, std::vector<int> &matched_indices)
{
    for(size_t i = 0; i < matched_indices.size(); i++)
    {
        if(matched_indices[i] == check_index)
            return true;
    }
    return false;
}


// =====================
void Tracker::initTracking(ObjectDetection object, ObjectDetection detection, cv::Mat image)
{
    kstate new_state;
    cv::KalmanFilter KF(8, 4, 0);

    KF.transitionMatrix = (cv::Mat_<float>(8, 8)
    <<	1, 0, 0, 0, 1, 0, 0, 0,
        0, 1, 0, 0, 0, 1, 0, 0,
        0, 0, 1, 0, 0, 0, 1, 0,
        0, 0, 0, 1, 0, 0, 0, 1,
        0, 0, 0, 0, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 1);

    //init pre
    KF.statePre.at<float>(0) = object._rect.x;
    KF.statePre.at<float>(1) = object._rect.y;
    KF.statePre.at<float>(2) = object._rect.width;//XY Only
    KF.statePre.at<float>(3) = object._rect.height;//XY Only
    //init post
    KF.statePost.at<float>(0) = object._rect.x;
    KF.statePost.at<float>(1) = object._rect.y;
    KF.statePost.at<float>(2) = object._rect.width;//XY Only
    KF.statePost.at<float>(3) = object._rect.height;//XY Only

    cv::setIdentity(KF.measurementMatrix);
    cv::setIdentity(KF.processNoiseCov, cv:: Scalar::all(_NOISE_COV));//1e-4
    cv::setIdentity(KF.measurementNoiseCov, cv::Scalar::all(_MEAS_NOISE_COV));//1e-3
    cv::setIdentity(KF.errorCovPost, cv::Scalar::all(_ERROR_ESTIMATE_COV));//100

    //clip detection
    //check that predicted positions are inside the image
    if (detection._rect.x < 0)
        detection._rect.x = 0;
    if (detection._rect.x > image.cols)
        detection._rect.x = image.cols - 1;
    if (detection._rect.y < 0)
        detection._rect.y = 0;
    if (detection._rect.height > image.rows)
        detection._rect.height = image.rows - 1;
    if (detection._rect.width + detection._rect.x > image.cols)
        detection._rect.width = image.cols - detection._rect.x;
    if (detection._rect.height + detection._rect.y > image.rows)
        detection._rect.height = image.rows - detection._rect.y;

    //save data to kstate
    new_state.active = true;
    new_state.image = image(cv::Rect(detection._rect.x,
                                    detection._rect.y,
                                    detection._rect.width,
                                    detection._rect.height)).clone();//Crop image and obtain only object (ROI)
    new_state.KF = KF;
    new_state.lifespan = _INITIAL_LIFESPAN;//start only with 1
    new_state.pos = object._rect;
    new_state.score = object._score;
    new_state.id = getAvailableIndex();
    new_state.color = cv::Scalar(255, 0, 0);
    new_state.real_data = 1;
    new_state.classID = detection._classID;
    _kstates.push_back(new_state);
}



// =====
void Tracker::ApplyNonMaximumSuppresion()
{
    std::vector<kstate > tmp_source = _kstates;

    if (tmp_source.empty())
        return ;

    size_t size = _kstates.size();

    std::vector<float> area(size);
    std::vector<float> scores(size);
    std::vector<int> x1(size);
    std::vector<int> y1(size);
    std::vector<int> x2(size);
    std::vector<int> y2(size);
    std::vector<size_t> indices(size);
    std::vector<bool> is_suppresed(size);

    // populate area, indices, is_suppressed, scores, x1, y1, x2, y2
    for(size_t i = 0; i< size; i++)
    {
        kstate tmp = _kstates[i];
        area[i] = tmp.pos.width * tmp.pos.height;
        indices[i] = i;
        is_suppresed[i] = false;
        scores[i] = tmp.score;
        x1[i] = tmp.pos.x;
        y1[i] = tmp.pos.y;
        x2[i] = tmp.pos.width + tmp.pos.x;
        y2[i] = tmp.pos.height + tmp.pos.y;
    }

    // sort with respect to scores
    Sort(scores, indices);

    for(size_t i=0; i< size; i++)
    {
        if(!is_suppresed[indices[i]])
        {
            for(size_t j= i+1; j< size; j++)
            {
                int x1_max = std::max(x1[indices[i]], x1[indices[j]]);
                int x2_min = std::min(x2[indices[i]], x2[indices[j]]);
                int y1_max = std::max(y1[indices[i]], y1[indices[j]]);
                int y2_min = std::min(y2[indices[i]], y2[indices[j]]);
                int overlap_width = x2_min - x1_max + 1;
                int overlap_height = y2_min - y1_max + 1;
                if(overlap_width > 0 && overlap_height>0)
                {
                    float overlap_part = (overlap_width*overlap_height)/area[indices[j]];
                    if(overlap_part > _OVERLAPPING_PERC)
                    {
                        is_suppresed[indices[j]] = true;
                    }
                }
            }
        }
    }


    size_t size_out = 0;
    for (size_t i = 0; i < size; i++)
    {
        if (!is_suppresed[i])
            size_out++;
    }

    std::vector< kstate > filtered_detections(size_out);

    size_t index = 0;
    for(size_t i = 0 ; i < size; i++)
    {
        if(!is_suppresed[indices[i]])
        {
            filtered_detections[index] = _kstates[indices[i]];
            index++;
        }
    }
    _kstates = filtered_detections;
}


// ===========================
void Tracker::ApplyGroupRectactangleSuppression()
{

}


// =========================
void Tracker::getRectFromPoints(std::vector< cv::Point2f > corners, cv::Rect& outBoundingBox)
{
    int min_x=0, min_y=0, max_x=0, max_y=0;
    for (unsigned int i=0; i<corners.size(); i++)
    {
        if (corners[i].x > 0)
        {
            if (corners[i].x < min_x)
                min_x = corners[i].x;
            if (corners[i].x>max_x)
                max_x = corners[i].x;
        }
        if (corners[i].y > 0)
        {
            if (corners[i].y < min_y)
                min_y = corners[i].y;
            if (corners[i].y > max_y)
                max_y = corners[i].y;
        }
    }
    outBoundingBox.x 		= min_x;
    outBoundingBox.y 		= min_y;
    outBoundingBox.width 	= max_x - min_x;
    outBoundingBox.height 	= max_y - min_y;

}

//============================
/**
 * @brief Tracker::crossCorr
 *
 * @param im1
 * @param im2
 * @return
 */
bool Tracker::crossCorr(cv::Mat im1, cv::Mat im2)
{
    if (im1.rows <= 0 || im1.cols <= 0 || im2.rows <= 0 || im2.cols <= 0)
        return false;

    cv::Mat result, larger_im, smaller_im;

    /// Create the result matrix
    int result_cols;
    int result_rows;

    //select largest image
    if (im2.cols > im1.cols)
    {
        larger_im = im2;
        smaller_im = im1;
    }
    else
    {
        larger_im = im1;
        smaller_im = im2;
    }
    //check rows to be also larger otherwise crop the smaller to remove extra rows
    if (larger_im.rows < smaller_im.rows)
    {
        //add rows to match sizes
        cv::Mat rows = cv::Mat::ones(smaller_im.rows - larger_im.rows, larger_im.cols, larger_im.type());
        larger_im.push_back(rows);
    }

    result_cols = larger_im.cols - smaller_im.cols + 1;
    result_rows = larger_im.rows - smaller_im.rows + 1;
    result.create(result_cols, result_rows, CV_32FC1);

//    http://docs.opencv.org/2.4/doc/tutorials/imgproc/histograms/template_matching/template_matching.html
//    SQDIFF \n 1: SQDIFF NORMED \n 2: TM CCORR \n 3: TM CCORR NORMED \n 4: TM COEFF \n 5: TM COEFF NORMED";
    /// Do the Matching and Normalize
    matchTemplate(larger_im, smaller_im, result, CV_TM_CCORR_NORMED);
    normalize(result, result, 0, 1, cv::NORM_MINMAX, -1, cv::Mat());

    /// Localizing the best match with minMaxLoc
    double minVal; double maxVal; cv::Point minLoc; cv::Point maxLoc;
    cv::Point matchLoc;

    minMaxLoc(result, &minVal, &maxVal, &minLoc, &maxLoc, cv::Mat());

    matchLoc = maxLoc;

    bool ret;
    int thresWidth = (larger_im.cols)*.7;
    if ( (maxVal > 0.5) && (smaller_im.cols > thresWidth) )//good threshold and consistent size
    {
        //std::cout << "matched" << endl;
        ret = true;
    }
    else
    {
        //std::cout << "non matched" << endl;
        ret = false;
    }

    return ret;
}


// =====================
void Tracker::posScaleToBbox()
{
    _tracked_detections.clear();

    for (size_t i = 0; i < _kstates.size(); i++)
    {
        if (_kstates[i].active)
        {
            kstate tmp;
            tmp.pos.x = _kstates[i].pos.x;// -(kstates[i].pos.width / 2);
            tmp.pos.y = _kstates[i].pos.y;// -(kstates[i].pos.height / 2);
            tmp.pos.width = _kstates[i].pos.width;
            tmp.pos.height = _kstates[i].pos.height;
            tmp.color = _kstates[i].color;
            tmp.id = _kstates[i].id;
            tmp.score = _kstates[i].score;
            tmp.lifespan = _kstates[i].lifespan;
            tmp.real_data = _kstates[i].real_data;

            if (tmp.pos.x < 0)
                tmp.pos.x = 0;
            if (tmp.pos.y < 0)
                tmp.pos.y = 0;

            _tracked_detections.push_back(tmp);
        }
    }
}


// ====================
size_t Tracker::getAvailableIndex()
{
    _next_track_id++;
    return (_next_track_id -1);
}


// ===========================
bool Tracker::isInRemoved(std::vector<unsigned int> removedIndices, unsigned int index)
{
    for (unsigned int i=0; i< removedIndices.size(); i++)
    {
        if (index == removedIndices[i])
            return true;
    }
    return false;
}


// =====================
void Tracker::removeUnusedObjects()
{
    std::vector<kstate>::iterator it;
    for(it = _kstates.begin(); it != _kstates.end();)
    {
        if (!(it->active))
            it = _kstates.erase(it);
        else
            it++;
    }
}


// ====================
void Tracker::Sort(const std::vector<float> in_scores, std::vector<size_t> &in_out_indices)
{
    for (unsigned int i = 0; i < in_scores.size(); i++)
    {
        for (unsigned int j = i + 1; j < in_scores.size(); j++)
        {
            if (in_scores[in_out_indices[j]] > in_scores[in_out_indices[i]])
            {
                int index_tmp = in_out_indices[i];
                in_out_indices[i] = in_out_indices[j];
                in_out_indices[j] = index_tmp;
            }
        }
    }
}
