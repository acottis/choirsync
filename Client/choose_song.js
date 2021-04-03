const audio_base_url = 'https://storage.googleapis.com/choirsync.appspot.com/static/audio'

const song_name_choose = document.getElementById("choose_song")
const singing_part_choose = document.getElementById("choose_track")

export let song_name
let singing_part
export let backing_track_file
export let song_is_chosen = false

export const change_song_names = () => {
    const song_names = ["Athchuinge", "In Dulci Jubilo"]
    song_names.forEach(song => {
        const option = document.createElement("option");
        option.text = song;
        song_name_choose.add(option)
    })
}

const change_track_names = () => {
    const track_names = ["Tenor Short", "Alto", "All parts"]
    singing_part_choose.selectedIndex = 0
    const prev_tracks = Array.from(singing_part_choose.options)
    prev_tracks.shift() //exclude blank option
    prev_tracks.forEach( track => {
        singing_part_choose.remove(track.index)
    })
    track_names.forEach(track => {
        const option = document.createElement("option");
        option.text = track;
        singing_part_choose.add(option)
    })
}

song_name_choose.onchange = function (){
    song_is_chosen = false
    change_track_names()
}
singing_part_choose.onchange = function (){
    song_name = song_name_choose.value
    singing_part = singing_part_choose.value
    backing_track_file = audio_base_url + '/' + song_name + '/' + song_name + '_' + singing_part + ".webm"
    song_is_chosen = true
}