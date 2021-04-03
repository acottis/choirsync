import * as funcs from "/play_pause_stop.js"
import {backing_track_file, song_name, singing_part, song_is_chosen} from "/choose_song.js"
import {password_entered} from "/log_in.js"

const button_rec = document.getElementById("button_rec")
const button_stop_rec = document.getElementById("button_stop_rec")
const recordings_area = document.getElementById("recordings_area")

let record_mode = false
let recordings = []

const start_recording = () => {
    if (funcs.audio_playing == false && record_mode == false && song_is_chosen){
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
                    //console.log("New Chunk")
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
                    const time_id = new Date(Date.now())
                    const new_recording = {
                        "blob": recording_blob,
                        "audio": new Audio(audioUrl),
                        "song": song_name,
                        "time_display": time_id.toUTCString(),
                        "time_id": time_id
                    }
                    recordings.push(new_recording)
                    add_recording_to_page(recordings.length-1)
                    //log_times(timers);
                    record_mode = false
                });

            });
    }
};

const add_recording_to_page = (index) => {

    const new_recording_div = document.createElement("div")
    new_recording_div.id = `recording_${recordings[index].time_id}`
    
    const recording_text = document.createTextNode(`Recording of ${song_name} using ${singing_part} from ${recordings[index].time_display} `) 
    new_recording_div.appendChild(recording_text)
    new_recording_div.appendChild(document.createElement("br"))

    const button_play_rec = document.createElement("button")
    button_play_rec.innerHTML = "play recording"
    button_play_rec.onclick = function(){
        funcs.play_audio(recordings[index].audio);
    }
    button_play_rec.id = `button_play_rec_${recordings[index].time_id}`
    new_recording_div.appendChild(button_play_rec)

    const button_pause_rec = document.createElement("button")
    button_pause_rec.innerHTML = "pause recording"
    button_pause_rec.onclick = function(){
        funcs.pause_play(recordings[index].audio);
    }
    button_pause_rec.id = `button_pause_rec_${recordings[index].time_id}`
    new_recording_div.appendChild(button_pause_rec)

    const button_stop_rec = document.createElement("button")
    button_stop_rec.innerHTML = "stop/reset recording"
    button_stop_rec.onclick = function(){
        funcs.stop_play(recordings[index].audio);
    }
    button_stop_rec.id = `button_stop_rec_${recordings[index].time_id}`
    new_recording_div.appendChild(button_stop_rec)

    const button_send_rec = document.createElement("button")
    button_send_rec.innerHTML = "send recording"
    button_send_rec.onclick = function(){
        send_recording(recordings[index].blob);
    }
    button_send_rec.id = `button_send_rec_${recordings[index].time_id}`
    new_recording_div.appendChild(button_send_rec)

    const button_delete_rec = document.createElement("button")
    button_delete_rec.innerHTML = "delete recording"
    button_delete_rec.onclick = function(){
        delete_recording(recordings[index].time_id);
    }
    button_delete_rec.id = `button_delete_rec_${recordings[index].time_id}`
    new_recording_div.appendChild(button_delete_rec)

    recordings_area.appendChild(new_recording_div);
}

const send_recording = (recording_blob) => {
    const singer_name = prompt("What is your name?")
    const singing_part = prompt("What part are you singing?")
    const message = prompt("message?")
    const date_id = new Date(Date.now())

    const fd = new FormData();
    fd.append('recording', recording_blob, `${song_name}_${singer_name}_${singing_part}_${date_id.toISOString()}.webm`)
    fd.append('singer_name', singer_name)
    fd.append('message', message)
    fd.append('password', password_entered)

    fetch(`/api/v0/recording`, {
        method: "post",
        body: fd
    })
    .then( res => res.json() )
    .then ( json_response => {
        console.log(json_response.message)
    });
}

const delete_recording = (id) => {
    const recordings_to_delete = document.getElementById(`recording_${id}`)
    recordings_to_delete.remove()
}

button_rec.onclick = start_recording

const log_times = (timers) =>{
    let text = "\n\nTimers"
    for (const [key, value] of Object.entries(timers)) {
        text += `\n${key}, ${value - timers["AudioLoad"]}`
    }
    var b = document.createElement('b');
    document.body.appendChild(b);
    b.innerText = text;
}