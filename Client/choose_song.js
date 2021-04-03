import {password_entered} from "/log_in.js"

const audio_base_url = 'https://storage.googleapis.com/choirsync.appspot.com/static/audio'

const song_name_choose = document.getElementById("choose_song")
const singing_part_choose = document.getElementById("choose_track")

let all_song_list = []

export let song_name
export let singing_part
export let backing_track_file
export let song_is_chosen = false

export const set_up_songs = async () => {
    get_songs().then ( password_correct => {
        if (password_correct) {
            change_song_names()
        }
    })
}
const change_song_names = () => {
    let song_list = []
    all_song_list.forEach(track => {
        if ( !(song_list.includes(track.song)) ) {
            song_list.push(track.song)
        }
    })
    song_list.forEach(song => {
        const option = document.createElement("option");
        option.text = song;
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
}
singing_part_choose.onchange = function (){
    singing_part = singing_part_choose.value
    if (song_name != "blank" && singing_part != "blank"){
        backing_track_file = audio_base_url + '/' + song_name + '/' + song_name + '_' + singing_part + ".webm"
        song_is_chosen = true
    }
    else{
        song_is_chosen = false
    }
}