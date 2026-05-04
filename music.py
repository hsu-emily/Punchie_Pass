import numpy as np
import simpleaudio as sa

SAMPLE_RATE = 44100

def tone(freq, duration, volume=0.4):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    wave = np.sin(freq * t * 2 * np.pi)
    audio = (wave * volume * 32767).astype(np.int16)
    return audio

# build a little melody
notes = [
    (523.25, 0.2),  # C5
    (659.25, 0.2),  # E5
    (783.99, 0.2),  # G5
    (1046.5, 0.4),  # C6
]

song = np.concatenate([tone(freq, dur) for freq, dur in notes])

# ▶️ play immediately
play_obj = sa.play_buffer(song, 1, 2, SAMPLE_RATE)
play_obj.wait_done()



# from scipy.io.wavfile import write
# from pydub import AudioSegment

# write("song.wav", SAMPLE_RATE, song)

# audio = AudioSegment.from_wav("song.wav")
# audio.export("song.mp3", format="mp3")

# print("Saved as song.mp3!")