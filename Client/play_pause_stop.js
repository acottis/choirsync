export let audio_playing = false

export const play_audio = (current_audio) => {
    if (audio_playing == false){
        current_audio.play();
        audio_playing = true
        
        current_audio.addEventListener("ended", event => {
            stop_play(current_audio)
        });
        
    }
}

export const pause_play = (current_audio) => {
    if (audio_playing){
        current_audio.pause()
        audio_playing = false
    }
}

export const stop_play = (current_audio) => {
    if (audio_playing){
        pause_play(current_audio)
    }
    current_audio.currentTime = 0
}