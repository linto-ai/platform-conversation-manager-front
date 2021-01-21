<template>
  <div id="audio-player" class="flex row" :class="audioIsPlaying ? 'isPlaying' : ''">
    <div class="flex col control">
      <button 
        @click="playPrevSpeaker()"
        class="audio-player--control audio-player--btn__prevspeaker"
      ></button>
      <span class="audio-player--control__label">Prev. speaker</span>
    </div>
    
    <button 
      @click="audioIsPlaying ? pause() : play()"
      :class="audioIsPlaying ? 'audio-player--btn__pause' : 'audio-player--btn__play'"
      class="audio-player--control"
    ></button> 
    <div class="flex col control">
      <button 
        @click="playNextSpeaker()"
        class="audio-player--control audio-player--btn__nextspeaker"
      ></button>
      <span class="audio-player--control__label">Next speaker</span>
    </div>

    <div class="audio-player--timeline flex1">
      <input type="range" min="0" class="audio-player--timeline__input" @mousedown="pause()" :value="prctTimeline" @change="playFromTimeLine($event)" @input="updateTimeline($event)"/>
      <span class="audio-player--timeline__played" :style="`width: ${prctTimelineSelected}%`"></span>
      <span class="audio-player--timeline__bg"></span>
    </div>
    <span class="audio-player--timeline__time"> {{ currentTimeHMS }} / {{ durationHMS }}</span>
    
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  props: ['audioFile', 'duration'],
  data () {
    return {
      currentTime: 0,
      prctTimelineSelected: 0,
      audioIsPlaying: false,
      audioPlayer: null
    }
  },
  mounted () {
    this.initAudioPlayer()
  },
  computed : {
    prctTimeline () {
      return this.currentTime * 100 / this.duration
    },
    currentTimeHMS () {
      return this.timeToHMS(this.currentTime)
    },
    durationHMS () {
      return this.timeToHMS(this.duration)
    }
  },
  watch:  {
    prctTimeline (data) {
      this.prctTimelineSelected = data
    }
  },
  methods : {
    initAudioPlayer() {
      this.audioPlayer = new Audio()
      this.audioPlayer.src = this.audioFile
      this.audioPlayer.ontimeupdate = () => {
        this.updateTime()
      }
      
      this.audioPlayer.addEventListener('playing', () => {
        this.audioIsPlaying = true
      })
      
      this.audioPlayer.addEventListener('pause', () => {
        this.audioIsPlaying = false
      })

      bus.$on('audio_player_playfrom', (data) => {
        this.playFrom(data.time)
      })
      bus.$on('audio_player_pause', (data) => {
        this.pause()
      })
      bus.$on('audio_player_play', (data) => {
        this.play()
      })
    },
    playFrom(time) {
      this.pause()
      this.audioPlayer.currentTime = time
      this.play()
    },
    playFromTimeLine (e) {
      const val = e.srcElement.value
      const targetTime = parseInt(val * this.duration / 100)
      this.playFrom(targetTime)
    },
    updateTime () {
      this.currentTime = this.audioPlayer.currentTime
      bus.$emit('audio_player_currenttime', {time : this.currentTime })
    },
    play () {
      this.audioPlayer.play()
    },
    pause () {
      this.audioPlayer.pause()
    },
    timeToHMS (time) {
      const totalSeconds = parseInt(time)
      const hour = Math.floor(time / (60 * 60))
      const min = Math.floor(time / 60)
      const sec =  Math.floor(time % 60)
      return `${hour < 10  ? '0' + hour : hour}:${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec }`
    },
    playPrevSpeaker () {
      bus.$emit('audio_player_prev_speaker', {})
    },
    playNextSpeaker () {
      bus.$emit('audio_player_next_speaker', {})
    },
    updateTimeline (e) {
      this.prctTimelineSelected = e.srcElement.value
    }
  }
}
</script>