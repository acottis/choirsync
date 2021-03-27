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
      type: 'audio/webm'
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

const times = []

const both_audio = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {

            audio.play();
            times[0]=new Date();
            const start = new Date();

            const audioChunks = [];
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType : 'audio/webm'
            });

            audio.addEventListener("pause", event => {
                times[1]=new Date();
                const ended = new Date();
                const delta = ended - start
                console.log(delta)
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.innerText = delta;

                const text = `\n ${times[0]*1} audio.play\n
                ${times[1]*1} pause listener\n
                ${times[2]*1} playing listener\n
                ${times[3]*1} mediaRecorder.start\n
                ${times[4]*1} stop listener\n
                ${times[5]*1} mediaRecorder.stop\n
                ${times[6]*1} audio.pause\n`
                var b = document.createElement('b');
                document.body.appendChild(b);
                b.innerText = text;

            })

            audio.addEventListener("playing", event => {
                times[2]=new Date();
        
                console.log(event)
                mediaRecorder.start();
                times[3]=new Date();
                
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });
    
                mediaRecorder.addEventListener("stop", () => {
                    times[4]=new Date();
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
                    times[5]=new Date();
                    audio.pause();
                    times[6]=new Date();
                    audio.currentTime = 0;
                }, 15000);
            })
        });
};



button_play.onclick = play_audio
button_rec.onclick = rec_audio
button_both.onclick = both_audio




