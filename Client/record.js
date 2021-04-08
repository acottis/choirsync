import {backing_track_file, song_name, singing_part, song_is_chosen, backing_audio_playing, mimetype_chosen} from "/choose_song.js"
import {password_entered} from "/log_in.js"

const button_rec = document.getElementById("button_rec")
const button_stop_rec = document.getElementById("button_stop_rec")
const recordings_area = document.getElementById("recordings_area")

let record_mode = false
let recordings = []
let rec_audio_playing = false

const start_recording = () => {
    if (backing_audio_playing || rec_audio_playing){
        alert("Recording not started, please pause music first")
    }
    else if (!record_mode && song_is_chosen){
        record_mode = true
        button_rec.className="rec_button"
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {

                const timers = {};
                const audioChunks = [];
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: mimetype_chosen
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
                });
                
                button_stop_rec.onclick = stop_recording

                backing_track.addEventListener("ended", event => {
                    timers["EndedListener"] = new Date();
                    stop_recording()
                });

                mediaRecorder.addEventListener("stop", () => {
                    finish_off()
                });

                const finish_off = () =>{
                    stream.getTracks()
                        .forEach(track => track.stop())
                    timers["StopTrack"] = new Date();
                    const recording_blob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(recording_blob);
                    const new_recording = {
                        "blob": recording_blob,
                        "audiourl": audioUrl,
                        "song": song_name,
                        "part": singing_part,
                        "time": new Date(Date.now())
                    }
                    recordings.push(new_recording)
                    add_recording_to_page(recordings.length-1)
                    log_times(timers);
                    button_rec.className="big_button"
                    button_stop_rec.onclick = null
                    record_mode = false
                }

            });
    }
};

const add_recording_to_page = (index) => {

    const new_recording_div = document.createElement("div")
    new_recording_div.className = "recording"
    new_recording_div.id = `recording_${recordings[index].time}`
    
    const recording_name_p = document.createElement("p")
    recording_name_p.className="recording_name"
    const recording_text = document.createTextNode(`Recording of ${recordings[index].song} using ${recordings[index].part} part`)
    recording_name_p.appendChild(recording_text)
    new_recording_div.appendChild(recording_name_p)
    
    const recording_time_p = document.createElement("p")
    recording_time_p.className="recording_time"
    const time_text = document.createTextNode(recordings[index].time)
    recording_time_p.appendChild(time_text)
    new_recording_div.appendChild(recording_time_p)

    const audio_player = document.createElement("audio")
    audio_player.controls = true
    audio_player.src = recordings[index].audiourl
    audio_player.id = `audio_player_${recordings[index].time}`
    new_recording_div.appendChild(audio_player)

    audio_player.addEventListener("play", event => {
        rec_audio_playing = true
    });
    audio_player.addEventListener("pause", event => {
        rec_audio_playing = false
    });
    audio_player.addEventListener("ended", event => {
        rec_audio_playing = false
    });

    new_recording_div.appendChild(document.createElement("br"))

    const button_send_rec = document.createElement("button")
    button_send_rec.innerHTML = "send recording"
    button_send_rec.onclick = function(){
        send_recording(recordings[index]);
    }
    button_send_rec.id = `button_send_rec_${recordings[index].time}`
    new_recording_div.appendChild(button_send_rec)

    const button_delete_rec = document.createElement("button")
    button_delete_rec.innerHTML = "delete recording"
    button_delete_rec.onclick = function(){
        delete_recording(recordings[index].time);
    }
    button_delete_rec.id = `button_delete_rec_${recordings[index].time}`
    new_recording_div.appendChild(button_delete_rec)

    recordings_area.appendChild(new_recording_div);
}

const send_recording = (recording) => {

    let response_text = "cancelled"
    let message = ""
    let send_song_name
    let send_singing_part
    let singer_name = prompt("What is your name?")
    if (singer_name != "" && singer_name != null){
        send_song_name = recording.song
        send_singing_part = prompt("What part are you singing?")
        if (send_singing_part != "" && send_singing_part != null){
            if (confirm("Do you want to add a message?")){
                message = prompt("Add a message to go with your recording")
            }
            response_text = `Hello ${singer_name}, you are about to send your recording of ${send_song_name}, ${send_singing_part} part`
        }
    }

    if (response_text != "cancelled"){
        if (confirm(response_text)){
            const date_id = new Date(Date.now())

            const fd = new FormData();
            fd.append('recording', recording.blob, `${send_song_name}_${singer_name}_${send_singing_part}_${date_id.toISOString()}.mp3`)
            fd.append('singer_name', singer_name)
            fd.append('message', message)
            fd.append('password', password_entered)

            fetch(`/api/v0/recording`, {
                method: "post",
                body: fd
            })
            .then( res => res.json() )
            .then ( json_response => {
                console.log(json_response)
                if (json_response.status == "success"){
                    alert(`Recording received, thank you ${singer_name}!`)
                }
                else{
                    alert(`Sorry, there was an error: "${json_response.message}"`)
                }

            });
        }
        else{
            alert("Recording not sent")
        }
    }
    else{
        alert("Recording not sent")
    }
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