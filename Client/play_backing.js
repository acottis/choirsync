import * as funcs from "/play_pause_stop.js"

import {backing_track_file} from "/choose_song.js"
import {song_is_chosen} from "/choose_song.js"

const button_play = document.getElementById("button_play")
const button_pause_play = document.getElementById("button_pause_play")
const button_stop_play = document.getElementById("button_stop_play")

let song_is_loaded = false
let backing_track_play
let prev_track

button_play.onclick = function(){
    if (song_is_chosen){
        if (prev_track != backing_track_file || song_is_loaded == false) {
            backing_track_play = new Audio(backing_track_file);
            prev_track = backing_track_file
            song_is_loaded = true
        }
        funcs.play_audio(backing_track_play)
    }
    else{
        song_is_loaded = false
    }
}
button_pause_play.onclick = function(){
    funcs.pause_play(backing_track_play)
}
button_stop_play.onclick = function(){
    funcs.stop_play(backing_track_play)
}