const startdiv = document.getElementById("welcome")
const maindiv = document.getElementById("requires_password")
maindiv.style.display = "none"

const button_authenticate = document.getElementById("button_authenticate")
const button_play = document.getElementById("button_play")
const button_pause_play = document.getElementById("button_pause_play")
const button_stop_play = document.getElementById("button_stop_play")
const button_rec = document.getElementById("button_rec")
const button_stop_rec = document.getElementById("button_stop_rec")
const button_play_rec = document.getElementById("button_play_rec")
const button_pause_play_rec = document.getElementById("button_pause_play_rec")
const button_stop_play_rec = document.getElementById("button_stop_play_rec")
const button_send_rec = document.getElementById("button_send_rec")

const authenticate = () => {
    startdiv.style.display = "none"
    maindiv.style.display = "block"
}

const audio_base_url = 'https://storage.googleapis.com/choirsync.appspot.com/static/audio'
const song_name = "Athchuinge"
const singing_part = "Tenor Short"
const backing_track_file = audio_base_url + '/' + song_name + '/' + song_name + '_' + singing_part + ".webm"

let recording_audio
let recording_ready = false

const backing_track_play = new Audio(backing_track_file);

let audio_playing = false

const play_audio = (current_audio) => {
    if (audio_playing == false){
        current_audio.play();
        audio_playing = true
        
        current_audio.addEventListener("ended", event => {
            stop_play(current_audio)
        });
        
    }
}

const pause_play = (current_audio) => {
    if (audio_playing){
        current_audio.pause()
        audio_playing = false
    }
}

const stop_play = (current_audio) => {
    if (audio_playing){
        pause_play(current_audio)
    }
    current_audio.currentTime = 0
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

const times = []
let record_mode = false

const start_recording = () => {
    if (record_mode == false){
        record_mode = true
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {

                const timers = {};
                const audioChunks = [];
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'audio/webm'
                });

                timers["AudioLoad"] = new Date();
                const backing_track = new Audio(backing_track_file);
                timers["AudioLoaded"] = new Date();

                const start_recording = () =>{
                    backing_track.play();
                    timers["PlayStarted"] = new Date();
                    mediaRecorder.start();
                    timers["RecordStarted"] = new Date();
                }

                const stop_recording = () =>{
                    mediaRecorder.stop();
                    timers["RecordPaused"] = new Date();
                    backing_track.pause();
                    timers["AudioPaused"] = new Date();
                }

                backing_track.addEventListener("canplaythrough", event => {
                    timers["CanplayListener"] = new Date();
                    start_recording()
                })

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                    console.log("New Chunk")
                });
                
                button_stop_rec.onclick = stop_recording

                backing_track.addEventListener("ended", event => {
                    timers["EndedListener"] = new Date();
                    stop_recording()
                });

                mediaRecorder.addEventListener("stop", () => {
                    stream.getTracks()
                        .forEach(track => track.stop())
                    timers["StopTrack"] = new Date();
                    const recording_blob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(recording_blob);
                    recording_audio = new Audio(audioUrl);
                    recording_ready = true
                    log_times(timers);
                    record_mode = false
                });

            });
    }
};

const log_times = (timers) =>{
    let text = "\n\nTimers"
    for (const [key, value] of Object.entries(timers)) {
        text += `\n${key}, ${value - timers["AudioLoad"]}`
    }
    var b = document.createElement('b');
    document.body.appendChild(b);
    b.innerText = text;
}

const send_recording = () => {
    if (recording_ready) {
        const fd = new FormData();
        fd.append('recording', recording_blob, "recording.webm")
        fd.append('message', "i like you adam")

        fetch(`/api/v0/recording`, {
            method: "post",
            body: fd
        }).then( res => {
            console.log(res)
        });
    }
}

button_authenticate.onclick = authenticate
button_play.onclick = function(){
    play_audio(backing_track_play)
}
button_pause_play.onclick = function(){
    pause_play(backing_track_play)
}
button_stop_play.onclick = function(){
    stop_play(backing_track_play)
}
button_rec.onclick = start_recording
button_play_rec.onclick = function(){
    if (recording_ready){
        play_audio(recording_audio);
    }
}
button_pause_play_rec.onclick = function(){
    if (recording_ready){
        pause_play(recording_audio)
    }
}
button_stop_play_rec.onclick = function(){
    if (recording_ready){
        stop_play(recording_audio)
    }
}
button_send_rec.onclick = send_recording