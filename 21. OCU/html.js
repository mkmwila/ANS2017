$('#upload-input').on('click', function(){

  var files = $("#degisecek").get(0).files;

  if (files.length > 0){

    var formData = new FormData();

    for (var i = 0; i < files.length; i++) {

      var file = files[i];

      formData.append('uploads[]', file, file.name);

    }
// YOU CAN ADD YOUR CUSTOM DATA IF YOU DONT WANT TO ASK USER FOR INPUT
var hoppala = "i wanted to use data which i already know --> for example : username" ;
    formData.append('field', hoppala);
// YOU CAN ADD YOUR CUSTOM DATA IF YOU DONT WANT TO ASK USER FOR INPUT

    $.ajax({

      url: '/upload',

      type: 'POST',

      data: formData,

      processData: false,

      contentType: false,

      success: function(data){

          console.log('upload successful!\n' + data);

      }

    });

  }

});