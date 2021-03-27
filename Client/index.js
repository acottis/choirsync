const button_play = document.getElementById("click_me_play")
const button_rec = document.getElementById("click_me_record")
const button_both = document.getElementById("click_me_both")
const audio_file = 'Music/InDulci.mpeg'



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
            
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType : 'audio/webm'
            });

            const audio = new Audio(audio_file);
            
            times[0]=new Date();

            const audioChunks = [];

            audio.addEventListener("canplaythrough", event => {
                times[3]=new Date();
                mediaRecorder.start();
                console.log(event) 
                

            })

            mediaRecorder.addEventListener("start", event => {              
                times[2]=new Date();
                audio.play();
                console.log(event)                
            })

            
            setTimeout(() => {
                mediaRecorder.stop();
                times[5]=new Date();
                audio.pause();
                // audio.currentTime = 0;
            }, 15000);            

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
                
            });
            
            mediaRecorder.addEventListener("stop", () => {
                times[4]=new Date();
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio_recording = new Audio(audioUrl);

                const text = `\n ${times[0]-times[0]} audio.play\n
                ${times[2]-times[0]} playinglistener\n
                ${times[3]-times[0]} mediaRecorder.start\n
                ${times[5]-times[0]} mediaRecorder.stop\n
                ${times[4]-times[0]} stoplistener`
                var b = document.createElement('b');
                document.body.appendChild(b);
                b.innerText = text;

                audio_recording.play();
                download(audioChunks);
                // fetch(`http://localhost:3000/recording`, {
                //     method: "POST",
                //     body: audioChunks
                // });

            });
        });
};



button_play.onclick = play_audio
button_rec.onclick = rec_audio
button_both.onclick = both_audio




