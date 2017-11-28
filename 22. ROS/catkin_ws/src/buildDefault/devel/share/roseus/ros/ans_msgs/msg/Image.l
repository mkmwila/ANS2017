;; Auto-generated. Do not edit!


(when (boundp 'ans_msgs::Image)
  (if (not (find-package "ANS_MSGS"))
    (make-package "ANS_MSGS"))
  (shadow 'Image (find-package "ANS_MSGS")))
(unless (find-package "ANS_MSGS::IMAGE")
  (make-package "ANS_MSGS::IMAGE"))

(in-package "ROS")
;;//! \htmlinclude Image.msg.html
(if (not (find-package "SENSOR_MSGS"))
  (ros::roseus-add-msgs "sensor_msgs"))


(defclass ans_msgs::Image
  :super ros::object
  :slots (_frameNum _im ))

(defmethod ans_msgs::Image
  (:init
   (&key
    ((:frameNum __frameNum) 0)
    ((:im __im) (instance sensor_msgs::Image :init))
    )
   (send-super :init)
   (setq _frameNum (round __frameNum))
   (setq _im __im)
   self)
  (:frameNum
   (&optional __frameNum)
   (if __frameNum (setq _frameNum __frameNum)) _frameNum)
  (:im
   (&rest __im)
   (if (keywordp (car __im))
       (send* _im __im)
     (progn
       (if __im (setq _im (car __im)))
       _im)))
  (:serialization-length
   ()
   (+
    ;; int64 _frameNum
    8
    ;; sensor_msgs/Image _im
    (send _im :serialization-length)
    ))
  (:serialize
   (&optional strm)
   (let ((s (if strm strm
              (make-string-output-stream (send self :serialization-length)))))
     ;; int64 _frameNum
#+(or :alpha :irix6 :x86_64)
       (progn (sys::poke _frameNum (send s :buffer) (send s :count) :long) (incf (stream-count s) 8))
#-(or :alpha :irix6 :x86_64)
       (cond ((and (class _frameNum) (= (length (_frameNum . bv)) 2)) ;; bignum
              (write-long (ash (elt (_frameNum . bv) 0) 0) s)
              (write-long (ash (elt (_frameNum . bv) 1) -1) s))
             ((and (class _frameNum) (= (length (_frameNum . bv)) 1)) ;; big1
              (write-long (elt (_frameNum . bv) 0) s)
              (write-long (if (>= _frameNum 0) 0 #xffffffff) s))
             (t                                         ;; integer
              (write-long _frameNum s)(write-long (if (>= _frameNum 0) 0 #xffffffff) s)))
     ;; sensor_msgs/Image _im
       (send _im :serialize s)
     ;;
     (if (null strm) (get-output-stream-string s))))
  (:deserialize
   (buf &optional (ptr- 0))
   ;; int64 _frameNum
#+(or :alpha :irix6 :x86_64)
      (setf _frameNum (prog1 (sys::peek buf ptr- :long) (incf ptr- 8)))
#-(or :alpha :irix6 :x86_64)
      (setf _frameNum (let ((b0 (prog1 (sys::peek buf ptr- :integer) (incf ptr- 4)))
                  (b1 (prog1 (sys::peek buf ptr- :integer) (incf ptr- 4))))
              (cond ((= b1 -1) b0)
                     ((and (= b1  0)
                           (<= lisp::most-negative-fixnum b0 lisp::most-positive-fixnum))
                      b0)
                    ((= b1  0) (make-instance bignum :size 1 :bv (integer-vector b0)))
                    (t (make-instance bignum :size 2 :bv (integer-vector b0 (ash b1 1)))))))
   ;; sensor_msgs/Image _im
     (send _im :deserialize buf ptr-) (incf ptr- (send _im :serialization-length))
   ;;
   self)
  )

(setf (get ans_msgs::Image :md5sum-) "8ccb20b8dbeb0b1f07dc0315418d3328")
(setf (get ans_msgs::Image :datatype-) "ans_msgs/Image")
(setf (get ans_msgs::Image :definition-)
      "int64 frameNum
sensor_msgs/Image im

================================================================================
MSG: sensor_msgs/Image
# This message contains an uncompressed image
# (0, 0) is at top-left corner of image
#

Header header        # Header timestamp should be acquisition time of image
                     # Header frame_id should be optical frame of camera
                     # origin of frame should be optical center of cameara
                     # +x should point to the right in the image
                     # +y should point down in the image
                     # +z should point into to plane of the image
                     # If the frame_id here and the frame_id of the CameraInfo
                     # message associated with the image conflict
                     # the behavior is undefined

uint32 height         # image height, that is, number of rows
uint32 width          # image width, that is, number of columns

# The legal values for encoding are in file src/image_encodings.cpp
# If you want to standardize a new string format, join
# ros-users@lists.sourceforge.net and send an email proposing a new encoding.

string encoding       # Encoding of pixels -- channel meaning, ordering, size
                      # taken from the list of strings in include/sensor_msgs/image_encodings.h

uint8 is_bigendian    # is this data bigendian?
uint32 step           # Full row length in bytes
uint8[] data          # actual matrix data, size is (step * rows)

================================================================================
MSG: std_msgs/Header
# Standard metadata for higher-level stamped data types.
# This is generally used to communicate timestamped data 
# in a particular coordinate frame.
# 
# sequence ID: consecutively increasing ID 
uint32 seq
#Two-integer timestamp that is expressed as:
# * stamp.sec: seconds (stamp_secs) since epoch (in Python the variable is called 'secs')
# * stamp.nsec: nanoseconds since stamp_secs (in Python the variable is called 'nsecs')
# time-handling sugar is provided by the client library
time stamp
#Frame this data is associated with
# 0: no frame
# 1: global frame
string frame_id

")



(provide :ans_msgs/Image "8ccb20b8dbeb0b1f07dc0315418d3328")


