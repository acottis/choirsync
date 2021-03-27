const button_play = document.getElementById("click_me_play")
const button_rec = document.getElementById("click_me_record")
const button_both = document.getElementById("click_me_both")
const audio_file = 'Music/InDulci.mpeg'

const audio = new Audio(audio_file);

const play_audio = () => {
    //const audio = new Audio(audio_file);
    audio.play();
}


function download(recordedChunks) {
    var blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'test.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  }



const rec_audio = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            const audioChunks = [];
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
            });

            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000);
        });
};

const both_audio = () => {

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {

            audio.play();

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType : 'audio/webm'
            });
            mediaRecorder.start();

            const audioChunks = [];
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio_recording = new Audio(audioUrl);
                console.log(audioChunks)
                audio_recording.play();
                download(audioChunks);
                // fetch(`http://localhost:3000/recording`, {
                //     method: "POST",
                //     body: audioChunks
                // });
            });


            setTimeout(() => {
                console.log()
                mediaRecorder.stop();
                audio.pause();
                audio.currentTime = 0;
            }, 30000);
        });
};



button_play.onclick = play_audio
button_rec.onclick = rec_audio
button_both.onclick = both_audio




