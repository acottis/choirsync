const button_rec = document.getElementById("button_rec")
const button_stop_rec = document.getElementById("button_stop_rec")
const button_play_rec = document.getElementById("button_play_rec")
const button_pause_play_rec = document.getElementById("button_pause_play_rec")
const button_stop_play_rec = document.getElementById("button_stop_play_rec")
const button_send_rec = document.getElementById("button_send_rec")

import * as funcs from "/play_pause_stop.js"

import {backing_track_file} from "/choose_song.js"

let record_mode = false
let recording_audio
let recording_blob
let recording_ready = false

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
                    recording_blob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(recording_blob);
                    recording_audio = new Audio(audioUrl);
                    recording_ready = true
                    log_times(timers);
                    record_mode = false
                });

            });
    }
};

const send_recording = () => {
    if (recording_ready) {
        const fd = new FormData();
        fd.append('recording', recording_blob, "recording.webm")
        fd.append('message', "i like you adam")
        fd.append('password', password_entered.value)

        fetch(`/api/v0/recording`, {
            method: "post",
            body: fd
        })
        .then( res => res.json() )
        .then ( json_response => {
            console.log(json_response.message)
        });
    }
}


button_rec.onclick = start_recording
button_play_rec.onclick = function(){
    if (recording_ready){
        funcs.play_audio(recording_audio);
    }
}
button_pause_play_rec.onclick = function(){
    if (recording_ready){
        funcs.pause_play(recording_audio)
    }
}
button_stop_play_rec.onclick = function(){
    if (recording_ready){
        funcs.stop_play(recording_audio)
    }
}
button_send_rec.onclick = send_recording


const log_times = (timers) =>{
    let text = "\n\nTimers"
    for (const [key, value] of Object.entries(timers)) {
        text += `\n${key}, ${value - timers["AudioLoad"]}`
    }
    var b = document.createElement('b');
    document.body.appendChild(b);
    b.innerText = text;
}