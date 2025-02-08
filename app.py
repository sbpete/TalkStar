import librosa
import numpy as np

def compute_jitter(f0):
    """
    Compute jitter (%) as the average absolute difference between consecutive F0 values
    divided by the mean F0.
    """
    # Remove NaN values from the pitch array
    f0_clean = f0[~np.isnan(f0)]
    if len(f0_clean) < 2:
        return np.nan
    diff = np.abs(np.diff(f0_clean))
    return (np.mean(diff) / np.mean(f0_clean)) * 100

def compute_shimmer(rms):
    """
    Compute shimmer (%) as the average absolute difference between consecutive RMS values
    divided by the mean RMS.
    """
    rms_clean = rms[~np.isnan(rms)]
    if len(rms_clean) < 2:
        return np.nan
    diff = np.abs(np.diff(rms_clean))
    return (np.mean(diff) / np.mean(rms_clean)) * 100

def analyze_voice(file_path):
    # Load the audio (forcing mono, resampled to 16kHz)
    y, sr = librosa.load(file_path, sr=16000, mono=True)
    
    # Extract pitch (f0) using librosa's pyin function.
    # f0 is an array of frequency estimates (in Hz) for each frame.
    f0, voiced_flag, voiced_prob = librosa.pyin(y, fmin=50, fmax=500, sr=sr)
    
    # Compute the mean pitch, ignoring unvoiced (NaN) frames.
    mean_pitch = np.nanmean(f0)
    
    # Compute jitter: the average relative change of F0 between consecutive frames.
    jitter = compute_jitter(f0)
    
    # Compute RMS energy for each frame (used as a proxy for amplitude)
    hop_length = 512  # You can adjust this value if needed.
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    
    # Compute shimmer: the average relative change in RMS energy between consecutive frames.
    shimmer = compute_shimmer(rms)
    
    return mean_pitch, jitter, shimmer

if __name__ == "__main__":
    file_path = input("Enter the file name (MP4, MP3, or WAV): ").strip()
    try:
        mean_pitch, jitter, shimmer = analyze_voice(file_path)
        print(f"Mean Pitch: {mean_pitch:.2f} Hz")
        print(f"Jitter: {jitter:.2f}%")
        print(f"Shimmer: {shimmer:.2f}%")
    except Exception as e:
        print(f"Error processing the file: {e}")
