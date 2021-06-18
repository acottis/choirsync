import {password_entered} from "/log_in.js"

const audio_base_url = 'https://storage.googleapis.com/choirsync.appspot.com/static/audio'

const song_name_choose = document.getElementById("choose_song")
const singing_part_choose = document.getElementById("choose_track")
const backing_player = document.getElementById("backing_player")
const record_area = document.getElementById("record")
const no_record_area = document.getElementById("no_record")

let all_song_list = []
let recordable

export let song_name
export let singing_part
export let backing_track_file
export let song_is_chosen = false
export let backing_audio_playing = false
export let mimetype_chosen

export const set_up_songs = async () => {
    get_songs().then ( password_correct => {
        if (password_correct) {
            change_song_names()
        }
    })
    
    if(MediaRecorder.isTypeSupported("audio/webm")){
        mimetype_chosen = "audio/webm"
    }
    else if(MediaRecorder.isTypeSupported("audio/mpeg")){
        mimetype_chosen = "audio/mpeg"
    }
    else{
        mimetype_chosen = 'audio/mp4;codecs="mp4a.67"'
    }
    test_media_type("audio/webm")
    test_media_type("audio/mpeg")
    test_media_type("audio/mp3")
    test_media_type("audio/mp4")
    test_media_type("audio/ogg")
    test_media_type("audio/aac")
    test_media_type("audio/flac")
    test_media_type("audio/x-flac")
    test_media_type("audio/wave")
    test_media_type("audio/wav")
    test_media_type("audio/x-wav")
    test_media_type("audio/x-pn_wav")
    test_media_type("audio/3gpp")
    test_media_type("audio/3gpp2")
    test_media_type("audio/3gp2")
}

const test_media_type = (type_test) =>{
    const test_result = MediaRecorder.isTypeSupported(type_test)
    console.log(type_test + " " + test_result)
}

const change_song_names = () => {
    let song_list = []
    all_song_list.forEach(track => {
        if ( !(song_list.some(song => song.name == track.song)) ) {
            song_list.push({
                name: track.song,
                recordable: track.recordable
            })
        }
    })
    song_list.forEach(song => {
        const option = document.createElement("option");
        option.text = song.name;
        if (!song.recordable){
            option.style.color = "darkgrey"
        }
        song_name_choose.add(option)
    })
}

const change_track_names = () => {
    singing_part_choose.selectedIndex = 0
    const prev_tracks = Array.from(singing_part_choose.options)
    prev_tracks.shift() //exclude blank option
    prev_tracks.forEach( track => {
        singing_part_choose.remove(track.index)
    })
    all_song_list.forEach(track => {
        if (track.song == song_name) {
            const option = document.createElement("option");
            option.text = track.part;
            singing_part_choose.add(option)
            recordable = track.recordable
        }
    })
}

const get_songs = () => {
    return new Promise (resolve =>{
        const password_send = {password: password_entered}
        fetch(`/api/v0/files`, {
            method: "post",
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(password_send)
        })
        .then( res => res.json() )
        .then(json_response => {
            if (json_response.status == "success"){
                all_song_list = json_response.songs
                resolve(true)
            }
            else {
                alert("Sorry, the password is not correct")
                resolve(false)
            }
        })
    })
}

song_name_choose.onchange = function (){
    song_name = song_name_choose.value
    song_is_chosen = false
    change_track_names()
    if (!recordable){
        record_area.style.display = "none";
        no_record_area.style.display = "inline";
    }
    else{
        record_area.style.display = null;
        no_record_area.style.display = null;
    }
}
singing_part_choose.onchange = function (){
    singing_part = singing_part_choose.value
    let norecord_flag = ""
    if (!recordable){
        norecord_flag = "NOREC "
    }
    if (song_name != "blank" && singing_part != "blank"){
        backing_track_file = audio_base_url + '/' + norecord_flag + song_name + '/' + song_name + '_' + singing_part + ".mp3"
        backing_player.setAttribute("src", backing_track_file)
        song_is_chosen = true
    }
    else{
        song_is_chosen = false
    }
}

backing_player.addEventListener("play", event => {
    backing_audio_playing = true
});
backing_player.addEventListener("pause", event => {
    backing_audio_playing = false
});
backing_player.addEventListener("ended", event => {
    backing_audio_playing = false
});

document.addEventListener('play', function(e){
    var audios = document.getElementsByTagName('audio');
    for(var i = 0, len = audios.length; i < len;i++){
        if(audios[i] != e.target){
            audios[i].pause();
        }
    }
}, true);