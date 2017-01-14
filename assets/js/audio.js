// Create an AudioContext instance for this sound
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
// Create a buffer for the incoming sound content
var source = audioContext.createBufferSource();
var gain = audioContext.createGain();
// Create the XHR which will grab the audio contents
var request = new XMLHttpRequest();
// Set the audio file src here
request.open('GET', 'assets/sound/newRobotGroove_v.0.2.mp3', true);
// Setting the responseType to arraybuffer sets up the audio decoding
request.responseType = 'arraybuffer';
request.onload = function() {
  // Decode the audio once the require is complete
  audioContext.decodeAudioData(request.response, function(buffer) {
    source.buffer = buffer;
    // Connect the audio to source (multiple audio buffers can be connected!)
    // source.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.value = 0.25;
    // Simple setting for the buffer
    source.loop = true;
    // Play the sound!
    source.start(0);
  }, function(e) {
    console.log('Audio error! ', e);
  });
}
// Send the request which kicks off 
request.send();

var soundToggle = document.querySelector('.sound_toggle');

soundToggle.addEventListener('click', function() {
  console.log(this);
  if (this.classList.contains('off')) {
    this.classList.remove('off');
    gain.gain.value = 0.25;
  }
  else {
    this.classList.add('off');
    gain.gain.value = 0;
  }

});