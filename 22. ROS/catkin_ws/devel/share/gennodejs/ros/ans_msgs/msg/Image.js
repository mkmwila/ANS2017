// Auto-generated. Do not edit!

// (in-package ans_msgs.msg)


"use strict";

const _serializer = _ros_msg_utils.Serialize;
const _arraySerializer = _serializer.Array;
const _deserializer = _ros_msg_utils.Deserialize;
const _arrayDeserializer = _deserializer.Array;
const _finder = _ros_msg_utils.Find;
const _getByteLength = _ros_msg_utils.getByteLength;
let sensor_msgs = _finder('sensor_msgs');

//-----------------------------------------------------------

class Image {
  constructor(initObj={}) {
    if (initObj === null) {
      // initObj === null is a special case for deserialization where we don't initialize fields
      this.frameNum = null;
      this.im = null;
    }
    else {
      if (initObj.hasOwnProperty('frameNum')) {
        this.frameNum = initObj.frameNum
      }
      else {
        this.frameNum = 0;
      }
      if (initObj.hasOwnProperty('im')) {
        this.im = initObj.im
      }
      else {
        this.im = new sensor_msgs.msg.Image();
      }
    }
  }

  static serialize(obj, buffer, bufferOffset) {
    // Serializes a message object of type Image
    // Serialize message field [frameNum]
    bufferOffset = _serializer.int64(obj.frameNum, buffer, bufferOffset);
    // Serialize message field [im]
    bufferOffset = sensor_msgs.msg.Image.serialize(obj.im, buffer, bufferOffset);
    return bufferOffset;
  }

  static deserialize(buffer, bufferOffset=[0]) {
    //deserializes a message object of type Image
    let len;
    let data = new Image(null);
    // Deserialize message field [frameNum]
    data.frameNum = _deserializer.int64(buffer, bufferOffset);
    // Deserialize message field [im]
    data.im = sensor_msgs.msg.Image.deserialize(buffer, bufferOffset);
    return data;
  }

  static getMessageSize(object) {
    let length = 0;
    length += sensor_msgs.msg.Image.getMessageSize(object.im);
    return length + 8;
  }

  static datatype() {
    // Returns string type for a message object
    return 'ans_msgs/Image';
  }

  static md5sum() {
    //Returns md5sum for a message object
    return '8ccb20b8dbeb0b1f07dc0315418d3328';
  }

  static messageDefinition() {
    // Returns full string definition for message
    return `
    int64 frameNum
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
    
    `;
  }

  static Resolve(msg) {
    // deep-construct a valid message object instance of whatever was passed in
    if (typeof msg !== 'object' || msg === null) {
      msg = {};
    }
    const resolved = new Image(null);
    if (msg.frameNum !== undefined) {
      resolved.frameNum = msg.frameNum;
    }
    else {
      resolved.frameNum = 0
    }

    if (msg.im !== undefined) {
      resolved.im = sensor_msgs.msg.Image.Resolve(msg.im)
    }
    else {
      resolved.im = new sensor_msgs.msg.Image()
    }

    return resolved;
    }
};

module.exports = Image;
