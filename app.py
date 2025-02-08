import speech_recognition as sr
from pydub import AudioSegment
import os
import sys

# Function to convert MP4 to WAV
def convert_mp4_to_wav(input_file, output_wav):
    try:
        audio = AudioSegment.from_file(input_file, format="mp4")  # Load MP4 file
        audio.export(output_wav, format="wav")  # Convert to WAV
        print(f"Converted {input_file} to {output_wav}")
    except Exception as e:
        print(f"Error converting file: {e}")
        sys.exit(1)

# Function to transcribe audio from a WAV file
def transcribe_audio(wav_file):
    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_file) as source:
        print("Processing audio file...")
        audio = recognizer.record(source)  # Read the entire file

    try:
        text = recognizer.recognize_google(audio)  # Use Google's Speech API
        return text
    except sr.UnknownValueError:
        return "Speech Recognition could not understand the audio"
    except sr.RequestError:
        return "Could not request results from Speech Recognition service"

if __name__ == "__main__":
    # Ask the user to enter a file name
    input_file = input("Enter the file name (MP4 or WAV): ").strip()

    # Check if the file exists
    if not os.path.isfile(input_file):
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)

    # Determine file type and process accordingly
    file_extension = os.path.splitext(input_file)[1].lower()

    if file_extension == ".mp4":
        output_wav = "converted.wav"
        convert_mp4_to_wav(input_file, output_wav)  # Convert MP4 to WAV
        transcription = transcribe_audio(output_wav)  # Transcribe the converted WAV file

    elif file_extension == ".wav":
        transcription = transcribe_audio(input_file)  # Directly transcribe WAV file

    else:
        print("Error: Unsupported file format. Please provide an MP4 or WAV file.")
        sys.exit(1)

    # Print the transcribed text
    print("\nTranscribed Text:\n", transcription)
