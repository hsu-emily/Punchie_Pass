import sys
import librosa
import numpy as np


def analyze(path, fmin="C2", fmax="C7", min_duration=0.05):
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
                notes.append((current, start, t - start))
            current = note
            start = t

    if current is not None and times[-1] - start >= min_duration:
        notes.append((current, start, times[-1] - start))

    return notes


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python analyze.py <file.mp3>")
        sys.exit(1)

    for note, start, dur in analyze(sys.argv[1]):
        print(f"{start:6.2f}s  {note:<4}  {dur:.2f}s")
