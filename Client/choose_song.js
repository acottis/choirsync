import {password_entered} from "/log_in.js"

const audio_base_url = 'https://storage.googleapis.com/choirsync.appspot.com/static/audio'

const want_sim = document.getElementById("want_sim")
const want_adv = document.getElementById("want_adv")
const want_rec = document.getElementById("want_rec")
const song_name_choose = document.getElementById("choose_song")
const singing_part_choose = document.getElementById("choose_track")
const singing_part_chooseL = document.getElementById("choose_trackL")
const singing_part_chooseR = document.getElementById("choose_trackR")
const backing_player = document.getElementById("backing_player")
const dual_player1 = document.getElementById("dual_player1")
const dual_player2 = document.getElementById("dual_player2")

const yes_record_divs = document.querySelectorAll('.yes_record')
const no_record_divs = document.querySelectorAll('.no_record')
const simdivs = document.querySelectorAll('.sim')
const advdivs = document.querySelectorAll('.adv')
const recdivs = document.querySelectorAll('.rec')

let all_song_list = []
let recordable = true
let on_rec_tab
let secret
let audioCtx1
let audioCtx2

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
        mimetype_chosen = "mimeType: audio/webm"
    }
    else if(MediaRecorder.isTypeSupported("audio/mpeg")){
        mimetype_chosen = "mimeType: audio/mpeg"
    }
    else{
        mimetype_chosen = ""
    }
}

const change_song_names = () => {
    let song_list = []
    all_song_list.forEach(track => {
        if ( !(song_list.some(song => song.name == track.song)) ) {
            song_list.push({
                name: track.song,
                recordable: track.recordable,
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
    change_track_names_X(singing_part_choose)
    change_track_names_X(singing_part_chooseL)
    change_track_names_X(singing_part_chooseR)
}
const change_track_names_X = (singing_part_chooseX) => {
    singing_part_chooseX.selectedIndex = 0
    const prev_tracks = Array.from(singing_part_chooseX.options)
    prev_tracks.shift() //exclude blank/None option
    prev_tracks.forEach( track => {
        singing_part_chooseX.remove(track.index)
    })
    all_song_list.forEach(track => {
        if (track.song == song_name) {
            const option = document.createElement("option");
            option.text = track.part;
            singing_part_chooseX.add(option)
            recordable = track.recordable
            secret = track.secret
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
    backing_player.setAttribute("src", "")
    dual_player1.setAttribute("src", "")
    dual_player2.setAttribute("src", "")
    change_track_names()
    if(on_rec_tab){
        if(!recordable){
            yes_record_divs.forEach(div => {
                div.style.display = "none"
            });
            no_record_divs.forEach(div => {
                div.style.display = "inline"
            });
        }
        else{
            yes_record_divs.forEach(div => {
                div.style.display = "block"
            });
            no_record_divs.forEach(div => {
                div.style.display = "none"
            });
        }
    }
}

const change_track = (chosen_part, player) => {
    let norecord_flag = ""
    let secret_flag = ""
    if (!recordable){
        norecord_flag = "NOREC "
    }
    if (secret){
        secret_flag = "SECRET "
    }
    if (song_name != "blank" && chosen_part != "blank"){
        backing_track_file = audio_base_url + '/' + norecord_flag + secret_flag + song_name + '/' + song_name + '_' + chosen_part + ".mp3"
        if(player=="main"){
            song_is_chosen = true
            singing_part = chosen_part
        }
    }
    else{
        backing_track_file = ""
        if(player=="main"){
            song_is_chosen = false
        }
    }
    switch(player){
        case "main":
            backing_player.setAttribute("src", backing_track_file)
            break;
        case "L":
            dual_player1.setAttribute("src", backing_track_file)
            dual_player2.pause()
            break;
        case "R":
            dual_player2.setAttribute("src", backing_track_file)
            dual_player1.pause()
            dual_player1.currentTime=0
    }
}

singing_part_choose.onchange = function (){
    change_track(singing_part_choose.value,"main")
}
singing_part_chooseL.onchange = function (){
    change_track(singing_part_chooseL.value,"L")
}
singing_part_chooseR.onchange = function (){
    change_track(singing_part_chooseR.value,"R")
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

dual_player1.addEventListener("play", event => {

    if (!audioCtx1) {
      audioCtx1 = new AudioContext();
      audioCtx2 = new AudioContext();
        let source1 = new MediaElementAudioSourceNode(audioCtx1, {
        mediaElement: dual_player1,
        });
        let source2 = new MediaElementAudioSourceNode(audioCtx2, {
        mediaElement: dual_player2,
        });
        let panNode1 = new StereoPannerNode(audioCtx1);
        let panNode2 = new StereoPannerNode(audioCtx2);
        panNode1.pan.value = -1;
        panNode2.pan.value = 1;
        source1.connect(panNode1);
        source2.connect(panNode2);
        panNode1.connect(audioCtx1.destination);
        panNode2.connect(audioCtx2.destination);
    }

    dual_player2.currentTime = dual_player1.currentTime
    dual_player2.volume = dual_player1.volume
    dual_player2.playbackRate = dual_player1.playbackRate
    dual_player2.muted = dual_player1.muted
    dual_player2.play()
    backing_audio_playing = true
});
dual_player1.addEventListener("pause", event => {
    dual_player2.pause()
    backing_audio_playing = false
});
dual_player1.addEventListener("ended", event => {
    backing_audio_playing = false
});

document.addEventListener('play', function(e){
    if(e.target.id != "dual_player2"){
        var audios = document.getElementsByTagName('audio');
        for(var i = 0, len = audios.length; i < len;i++){
            if(audios[i] != e.target && !((audios[i].id == "dual_player1") && (e.target.id == "dual_player2"))){
                audios[i].pause();
            }
        }
    }
}, true);

want_sim.onclick = function(){
    pause_all()
    advdivs.forEach(div => {
        div.style.display = "none"
    });
    recdivs.forEach(div => {
        div.style.display = "none"
    });
    simdivs.forEach(div => {
        div.style.display = "block"
    });
    on_rec_tab = false
}
want_adv.onclick = function(){
    pause_all()
    simdivs.forEach(div => {
        div.style.display = "none"
    });
    recdivs.forEach(div => {
        div.style.display = "none"
    });
    advdivs.forEach(div => {
        div.style.display = "block"
    });
    on_rec_tab = false
}
want_rec.onclick = function(){
    pause_all()
    advdivs.forEach(div => {
        div.style.display = "none"
    });
    simdivs.forEach(div => {
        div.style.display = "none"
    });
    recdivs.forEach(div => {
        div.style.display = "block"
    });
    on_rec_tab = true
    if(!recordable){
        yes_record_divs.forEach(div => {
            div.style.display = "none"
        });
    }
}

const pause_all = () => {
    var audios = document.getElementsByTagName('audio');
    for(var i = 0, len = audios.length; i < len;i++){
        audios[i].pause();
    }
}