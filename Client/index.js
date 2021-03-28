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
    let played = false;
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {

            const timers = {};
            const audioChunks = [];
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            timers["AudioLoad"] = new Date();
            const audio = new Audio(audio_file);
            timers["AudioLoaded"] = new Date();

            audio.addEventListener("canplaythrough", event => {
                timers["CanplayListener"] = new Date();
                audio.play();
                timers["PlayStarted"] = new Date();
                mediaRecorder.start();
                timers["RecordStarted"] = new Date();
                setTimeout(() => {
                    mediaRecorder.stop();
                    timers["RecordPaused"] = new Date();
                    audio.pause();
                    timers["AudioPaused"] = new Date();
                    //audio.currentTime = 0;
                }, 2000);
            })

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
                console.log("New Chunk")
            });

            mediaRecorder.addEventListener("stop", () => {
                //download(audioChunks);
                post_audio(audioChunks);
                //replay_audio(audioChunks);
                log_times(timers)

            });
        });
};

const log_times = (timers) =>{
    let text = "\nTimers"
    for (const [key, value] of Object.entries(timers)) {
        text += `\n${key}, ${value - timers["AudioLoad"]}`
    }
    var b = document.createElement('b');
    document.body.appendChild(b);
    b.innerText = text;
}

const replay_audio = (audioChunks) => {
    const audioBlob = new Blob(audioChunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio_recording = new Audio(audioUrl);
    audio_recording.play();
}

const post_audio = (audioChunks) => {
    const blob = new Blob(audioChunks);
    const reader = new FileReader();

    const fd = new FormData();
    fd.append('recording', blob, "recording.webm")

    fetch(`/api/v0/recording`, {
        method: "post",
        body: fd
    }).then( res => {
        console.log(res)
    });
}



button_play.onclick = play_audio
button_rec.onclick = rec_audio
button_both.onclick = both_audio
