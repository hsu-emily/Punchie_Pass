import numpy as np
import sounddevice as sd
import soundfile as sf
import librosa
from scipy.signal import fftconvolve

SAMPLE_RATE = 44100
MP3_PATH = "src/features/gacha/sounds/gatcha.mp3"

# Edit freely: (note, duration_seconds)
# Extracted from gatcha.mp3 with pitch range G4–D6
# -------------------------
# 🎵 PROGRESSION (GACHA)
# -------------------------
progression = [
    # — INTRO: shiny anticipation —
    ("F#5", 0.12, "pixel"),
    ("A5",  0.12, "pixel"),
    ("C#6", 0.14, "sparkle"),
    ("D6",  0.30, "sparkle"),
    (None,  0.08),

    # — FULL PIXEL PULL-UP: slower, chunkier, triumphant —
    (("D5", "A5"),                    0.11, "pixel"),
    (("D5", "F#5", "A5"),             0.12, "pixel"),
    (("D5", "F#5", "A5", "D6"),       0.15, "sparkle"),

    (("E5", "B5"),                    0.11, "pixel"),
    (("E5", "G5", "B5"),              0.12, "pixel"),
    (("E5", "G5", "B5", "E6"),        0.15, "sparkle"),

    (("F#5", "C#6"),                  0.11, "pixel"),
    (("F#5", "A5", "C#6"),            0.12, "pixel"),
    (("F#5", "A5", "C#6", "F#6"),     0.16, "sparkle"),

    (("A5", "D6"),                    0.12, "pixel"),
    (("A5", "C#6", "E6"),             0.14, "sparkle"),
    (("A5", "D6", "F#6", "A6"),       0.22, "sparkle"),

    (None, 0.08),

    # — TRIUMPH BUILD: bigger and slower (reveal run shimmers underneath) —
    (("D5", "A5", "D6"),                    0.20, "pixel"),
    (("D5", "F#5", "A5", "D6"),             0.25, "sparkle"),
    (("F#5", "A5", "D6", "F#6"),            0.28, "sparkle"),
    (("A5", "D6", "F#6", "A6"),             0.34, "sparkle"),

    (None, 0.05),

    # — BIG FINAL REVEAL HIT —
    (("D5", "D6", "F#6", "A6", "D7"),       1.05, "sparkle"),
]


# Played as a stacked sub-track underneath the triumph build chords.
reveal_run = [
    ("D6",  0.07, "sparkle"),
    ("E6",  0.07, "sparkle"),
    ("F#6", 0.07, "sparkle"),
    ("A6",  0.08, "sparkle"),
    ("C#7", 0.08, "sparkle"),
    ("D7",  0.18, "sparkle"),
]


# Voice presets: each defines a harmonic spectrum and default decay rate.
VOICES = {
    "bell": {
        # Richer bell: more harmonics for a fuller chime
        "harmonics": [(1, 1.0), (2, 0.6), (3, 0.4), (4, 0.25), (5, 0.18), (6, 0.12), (8, 0.08)],
        "decay": 1.8,
    },
    "trumpet": {
        # Brassy: strong low+mid harmonics with slow decay
        "harmonics": [(1, 1.0), (2, 0.85), (3, 0.7), (4, 0.55), (5, 0.4), (6, 0.3), (7, 0.2)],
        "decay": 1.2,
    },
    "pad": {
        # Soft sustained backing
        "harmonics": [(1, 1.0), (2, 0.5), (3, 0.3), (4, 0.2)],
        "decay": 1.5,
    },
}


def tone(notes, duration, volume=0.35, decay=None, attack=0.002, voice="bell"):
    n = int(SAMPLE_RATE * duration)
    if notes is None:
        return np.zeros(n)
    if isinstance(notes, str):
        notes = [notes]

    t = np.linspace(0, duration, n, False)
    wave = np.zeros(n)

    for note in notes:
        freq = librosa.note_to_hz(note)

        if voice == "pixel":
            wave += np.sign(np.sin(2 * np.pi * freq * t))

        elif voice == "sparkle":
            wave += (
                0.8 * np.sign(np.sin(2 * np.pi * freq * t)) +
                0.3 * np.sign(np.sin(2 * np.pi * freq * 2 * t))
            )

        elif voice == "bass":
            wave += np.sign(np.sin(2 * np.pi * freq * t)) * 0.8

        else:
            profile = VOICES.get(voice, VOICES["bell"])
            harmonics = profile["harmonics"]
            if decay is None:
                decay = profile["decay"]
            for h, amp in harmonics:
                wave += amp * np.sin(freq * h * t * 2 * np.pi)

    wave /= max(1, len(notes))

    if decay is None:
        decay = 1.8 if voice in ["pixel", "sparkle"] else 1.2

    envelope = np.exp(-decay * t / duration)

    attack_n = min(int(SAMPLE_RATE * attack), n // 2)
    if attack_n > 0:
        envelope[:attack_n] *= np.linspace(0, 1, attack_n)

    return wave * envelope * volume


def reverb(audio, decay_time=1.2, wet=0.18):
    """Convolve audio with a synthesized exponentially-decaying noise impulse response."""
    n_ir = int(SAMPLE_RATE * decay_time)
    rng = np.random.default_rng(7)
    ir = rng.standard_normal(n_ir) * np.exp(-4.0 * np.linspace(0, 1, n_ir))
    ir /= np.abs(ir).max()

    wet_sig = fftconvolve(audio, ir)
    dry = np.pad(audio, (0, len(wet_sig) - len(audio)))
    out = dry * (1 - wet) + wet_sig * wet

    peak = np.abs(out).max()
    if peak > 1:
        out /= peak
    return out


def delay(audio, time=0.09, taps=3, feedback=0.45, mix=0.18):
    """Discrete echo taps — gives that gacha-reveal sparkle."""
    delay_samples = int(SAMPLE_RATE * time)
    out = np.pad(audio, (0, delay_samples * taps))
    for i in range(1, taps + 1):
        offset = delay_samples * i
        amp = mix * (feedback ** (i - 1))
        out[offset:offset + len(audio)] += audio * amp
    return out


def _entry_voice(entry):
    """Progression entry can be (notes, dur) or (notes, dur, voice)."""
    return entry[2] if len(entry) >= 3 else "bell"


def render(progression):
    """Render a progression to a float waveform.
    Returns (waveform, total_duration_seconds)."""
    chunks = [tone(e[0], e[1], voice=_entry_voice(e)) for e in progression]
    return np.concatenate(chunks), sum(e[1] for e in progression)


def section_start(progression, index):
    """Time in seconds where progression[index] begins."""
    return sum(e[1] for e in progression[:index])


def build_audio(progression, overlays=(), tracks=(), apply_reverb=True):
    """Render progression + overlays + tracks into a final int16 stereo-ready waveform."""
    main, total = render(progression)
    n_total = int(SAMPLE_RATE * total)
    if len(main) < n_total:
        main = np.pad(main, (0, n_total - len(main)))

    for layer in overlays:
        notes, start, dur, vol, decay, voice = layer
        layer_wave = tone(notes, dur, volume=vol, decay=decay, attack=0.08, voice=voice)
        start_sample = int(SAMPLE_RATE * start)
        end_sample = start_sample + len(layer_wave)
        if end_sample > len(main):
            main = np.pad(main, (0, end_sample - len(main)))
        main[start_sample:end_sample] += layer_wave

    for sub_prog, start, vol in tracks:
        sub_wave, _ = render(sub_prog)
        sub_wave = sub_wave * vol
        start_sample = int(SAMPLE_RATE * start)
        end_sample = start_sample + len(sub_wave)
        if end_sample > len(main):
            main = np.pad(main, (0, end_sample - len(main)))
        main[start_sample:end_sample] += sub_wave

    main = delay(main, time=0.09, taps=3, feedback=0.45, mix=0.18)
    if apply_reverb:
        main = reverb(main, decay_time=0.55, wet=0.08)

    peak = np.abs(main).max()
    if peak > 1:
        main /= peak
    return (main * 32767).astype(np.int16)


def play(progression, overlays=(), tracks=(), apply_reverb=True):
    audio = build_audio(progression, overlays, tracks, apply_reverb)
    sd.play(audio, SAMPLE_RATE)
    sd.wait()


def save(path, progression, overlays=(), tracks=(), apply_reverb=True):
    """Write the rendered mix to a file. Format inferred from extension (.mp3, .wav, .flac, ...)."""
    audio = build_audio(progression, overlays, tracks, apply_reverb)
    sf.write(path, audio, SAMPLE_RATE)
    print(f"saved → {path}")


def extract_notes(path, fmin="G4", fmax="D6", min_duration=0.05):
    """Re-run if you want to regenerate `progression` from the mp3."""
    y, sr = librosa.load(path, sr=None, mono=True)
    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz(fmin),
        fmax=librosa.note_to_hz(fmax),
        sr=sr,
    )
    times = librosa.times_like(f0, sr=sr)

    notes = []
    current = None
    start = 0.0
    for t, freq, voiced in zip(times, f0, voiced_flag):
        note = librosa.hz_to_note(freq) if voiced and not np.isnan(freq) else None
        if note != current:
            if current is not None and t - start >= min_duration:
                notes.append((current.replace("♯", "#"), round(t - start, 2)))
            current = note
            start = t
    if current is not None and times[-1] - start >= min_duration:
        notes.append((current.replace("♯", "#"), round(times[-1] - start, 2)))
    return notes


if __name__ == "__main__":
    # Build-up section is the last 7 entries: rest + 4 chord stacks + rest + final hit.
    rest_start = section_start(progression, len(progression) - 7)
    pad_start = max(0.0, rest_start - 0.6)
    pad_dur = sum(e[1] for e in progression[-7:]) + (rest_start - pad_start)

    # Reveal run shimmers under the triumph chord stacks (starts at first triumph chord).
    triumph_start = section_start(progression, len(progression) - 6)

    overlays = [
        # (notes, start_seconds, duration, volume, decay, voice)
        (("D3", "A3", "D4"), pad_start, pad_dur, 0.22, 0.65, "pad"),
    ]
    tracks = [
        # (sub_progression, start_seconds, volume_multiplier)
        (reveal_run, triumph_start, 0.42),
    ]
    save("gacha_reveal.mp3", progression, overlays, tracks)
    play(progression, overlays, tracks)
