#include "detector_ssd.h"


Detector::Detector(const std::string &model_file, const std::string &trained_file,
                   const std::string &mean_file, const std::string &mean_value):
    _bicycle_id(2),
    _bus_id(6),
    _car_id(7),
    _motorbike_id(14),
    _person_id(15)
{
#ifdef CPU_ONLY
    caffe::Caffe::set_mode(caffe::Caffe::CPU);
#else
    caffe::Caffe::set_mode(caffe::Caffe::GPU);
#endif

    // Load the network
    _net.reset(new caffe::Net<float>(model_file, caffe::TEST));
    _net->CopyTrainedLayersFrom(trained_file);

//    CHECK_EQ(net_->num_inputs(), 1) << "Network should have exactly one input.";
//    CHECK_EQ(net_->num_outputs(), 1) << "Network should have exactly one output.";

    caffe::Blob<float>* input_layer = _net->input_blobs()[0];
    _num_channels = input_layer->channels();
//    CHECK(num_channels_ == 3 || num_channels_ == 1)
//      << "Input layer should have 1 or 3 channels.";
    _input_geometry = cv::Size(input_layer->width(), input_layer->height());

    /* Load the binaryproto mean file. */
    SetMean(mean_file, mean_value);
}


// ---------------
Detector::~Detector()
{}



// ------------------
std::vector<ObjectDetection> Detector::detect(cv::Mat &img)
{
    _triggerCount++;

    // predict
    caffe::Blob<float>* input_layer = _net->input_blobs()[0];
    input_layer->Reshape(1, _num_channels, _input_geometry.height,
                         _input_geometry.width);

    // Forward dimension change to all layers
    _net->Reshape();

    std::vector<cv::Mat> input_channels;
    wrapInputLayer(&input_channels);
    preProcess(img, &input_channels);


    _net->Forward();

    // Copy the output layer to a std::vector
    caffe::Blob<float>* result_blob = _net->output_blobs()[0];
    const float* result = result_blob->cpu_data();
    const int num_det = result_blob->height();

    std::vector<std::vector<float> > detections;
    std::vector<ObjectDetection> detection_objects;
    for (int k = 0; k < num_det; ++k)
    {
      if (result[0] == -1)
      {
        // Skip invalid detection.
        result += 7;
        continue;
      }

        // Detection format: [image_id, label, score, xmin, ymin, xmax, ymax]
      std::vector<float> detection(result, result + 7);
      detections.push_back(detection);
      result += 7;


      // draw a detection
      int x = detection[3]*img.cols;
      int y = detection[4]*img.rows;
      int width = (detection[5] - detection[3])*img.cols;
      int height = (detection[6] - detection[4])*img.rows;
      cv::Rect rect(x, y, width, height);

      // check that the score is above the threshold and the class is vehicles.
      if(detection[2] > 0.3)
      {
          ObjectDetection tmp;
          std::stringstream ss;

          if(int(detection[1]) ==  _bicycle_id)
          {
            tmp._rect = rect;
            tmp._score = detection[2];
            tmp._classID = 3;
            detection_objects.push_back(tmp);

          }
          else if( int(detection[1]) ==_bus_id)
          {
            tmp._rect = rect;
            tmp._score = detection[2];
            tmp._classID = 5;
            detection_objects.push_back(tmp);

          }
          else if ( int(detection[1]) == _car_id)
          {
            tmp._rect = rect;
            tmp._score = detection[2];
            tmp._classID = 0;
            detection_objects.push_back(tmp);

          }
          else if ( int(detection[1]) == _motorbike_id)
          {
              tmp._rect = rect;
              tmp._score = detection[2];
              tmp._classID = 4;
              detection_objects.push_back(tmp);
          }
          else if ( int(detection[1]) == _person_id)
          {
              tmp._rect = rect;
              tmp._score = detection[2];
              tmp._classID = 1;
              detection_objects.push_back(tmp);
          }
      }
    }

    return detection_objects;
}



// -------------------------------
void Detector::SetMean(const std::string& mean_file, const std::string& mean_value)
{
    cv::Scalar channel_mean;
  if (!mean_file.empty())
  {
    CHECK(mean_value.empty()) <<
      "Cannot specify mean_file and mean_value at the same time";
    caffe::BlobProto blob_proto;
    ReadProtoFromBinaryFileOrDie(mean_file.c_str(), &blob_proto);

    /* Convert from BlobProto to Blob<float> */
    caffe::Blob<float> mean_blob;
    mean_blob.FromProto(blob_proto);
    CHECK_EQ(mean_blob.channels(), _num_channels)
      << "Number of channels of mean file doesn't match input layer.";

    /* The format of the mean file is planar 32-bit float BGR or grayscale. */
    std::vector<cv::Mat> channels;
    float* data = mean_blob.mutable_cpu_data();
    for (int i = 0; i < _num_channels; ++i) {
      /* Extract an individual channel. */
      cv::Mat channel(mean_blob.height(), mean_blob.width(), CV_32FC1, data);
      channels.push_back(channel);
      data += mean_blob.height() * mean_blob.width();
    }

    /* Merge the separate channels into a single image. */
    cv::Mat mean;
    cv::merge(channels, mean);

    /* Compute the global mean pixel value and create a mean image
     * filled with this value. */
    channel_mean = cv::mean(mean);
    _mean = cv::Mat(_input_geometry, mean.type(), channel_mean);
  }
  if (!mean_value.empty()) {
    CHECK(mean_file.empty()) <<
      "Cannot specify mean_file and mean_value at the same time";
    std::stringstream ss(mean_value);
    std::vector<float> values;
    std::string item;
    while (getline(ss, item, ',')) {
      float value = std::atof(item.c_str());
      values.push_back(value);
    }
    CHECK(values.size() == 1 || values.size() == _num_channels) <<
      "Specify either 1 mean_value or as many as channels: " << _num_channels;

    std::vector<cv::Mat> channels;
    for (int i = 0; i < _num_channels; ++i) {
      /* Extract an individual channel. */
      cv::Mat channel(_input_geometry.height, _input_geometry.width, CV_32FC1,
          cv::Scalar(values[i]));
      channels.push_back(channel);
    }
    cv::merge(channels, _mean);
  }
}

/* Wrap the input layer of the network in separate cv::Mat objects
 * (one per channel). This way we save one memcpy operation and we
 * don't need to rely on cudaMemcpy2D. The last preprocessing
 * operation will write the separate channels directly to the input
 * layer. */
void Detector::wrapInputLayer(std::vector<cv::Mat>* input_channels)
{
  caffe::Blob<float>* input_layer = _net->input_blobs()[0];

  int width = input_layer->width();
  int height = input_layer->height();
  float* input_data = input_layer->mutable_cpu_data();
  for (int i = 0; i < input_layer->channels(); ++i) {
    cv::Mat channel(height, width, CV_32FC1, input_data);
    input_channels->push_back(channel);
    input_data += width * height;
  }
}

void Detector::preProcess(const cv::Mat& img,
                            std::vector<cv::Mat>* input_channels) {
  /* Convert the input image to the input image format of the network. */
  cv::Mat sample;
  if (img.channels() == 3 && _num_channels == 1)
    cv::cvtColor(img, sample, cv::COLOR_BGR2GRAY);
  else if (img.channels() == 4 && _num_channels == 1)
    cv::cvtColor(img, sample, cv::COLOR_BGRA2GRAY);
  else if (img.channels() == 4 && _num_channels == 3)
    cv::cvtColor(img, sample, cv::COLOR_BGRA2BGR);
  else if (img.channels() == 1 && _num_channels == 3)
    cv::cvtColor(img, sample, cv::COLOR_GRAY2BGR);
  else
    sample = img;

  cv::Mat sample_resized;
  if (sample.size() != _input_geometry)
    cv::resize(sample, sample_resized, _input_geometry);
  else
    sample_resized = sample;

  cv::Mat sample_float;
  if (_num_channels == 3)
    sample_resized.convertTo(sample_float, CV_32FC3);
  else
    sample_resized.convertTo(sample_float, CV_32FC1);

  cv::Mat sample_normalized;
  cv::subtract(sample_float, _mean, sample_normalized);

  /* This operation will write the separate BGR planes directly to the
   * input layer of the network because it is wrapped by the cv::Mat
   * objects in input_channels. */
  cv::split(sample_normalized, *input_channels);

  CHECK(reinterpret_cast<float*>(input_channels->at(0).data)
        == _net->input_blobs()[0]->cpu_data())
    << "Input channels are not wrapping the input layer of the network.";
}


