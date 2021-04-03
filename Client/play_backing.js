const button_play = document.getElementById("button_play")
const button_pause_play = document.getElementById("button_pause_play")
const button_stop_play = document.getElementById("button_stop_play")

import * as funcs from "/play_pause_stop.js"

import {backing_track_file} from "/choose_song.js"
const backing_track_play = new Audio(backing_track_file);

button_play.onclick = function(){
    funcs.play_audio(backing_track_play)
}
button_pause_play.onclick = function(){
    funcs.pause_play(backing_track_play)
}
button_stop_play.onclick = function(){
    funcs.stop_play(backing_track_play)
}