const audio_base_url = 'https://storage.googleapis.com/choirsync.appspot.com/static/audio'

const song_name_choose = document.getElementById("choose_song")
const singing_part_choose = document.getElementById("choose_track")

export let song_name
let singing_part
export let backing_track_file
export let song_is_chosen = false

const change_song_names = () => {
    const [files]
    console.log('Files:');
    files.forEach(file => {
      console.log(file.name);
    });
    // for (const [key, value] of Object.entries(timers)) {
    //     const option = document.createElement("option");
    //     option.text = "Tenor";
    //     song_name_choose.addEventListener(option)
    // }
}

song_name_choose.onchange = function (){
    song_is_chosen = false
    change_song_names()
    //reset track choices
}
singing_part_choose.onchange = function (){
    song_name = song_name_choose.value
    singing_part = singing_part_choose.value
    backing_track_file = audio_base_url + '/' + song_name + '/' + song_name + '_' + singing_part + ".webm"
    song_is_chosen = true
}