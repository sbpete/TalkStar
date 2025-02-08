import assemblyai as aai
import os
import time
import re
from collections import Counter

# Set your AssemblyAI API Key
API_KEY = "dfbd6698ce39402fba92db96f2fe6daf"  # Replace with your actual API key

# Initialize AssemblyAI Transcriber
aai.settings.api_key = API_KEY
transcriber = aai.Transcriber()

# Define common filler words
FILLER_WORDS = {"um", "uh", "like", "you know", "I mean", "so", "actually", "basically", "kind of", "sort of"}

def analyze_transcription(file_path):
    print(f"Uploading {file_path} for analysis...")

    # Enable AI features (Sentiment, Word Count)
    config = aai.TranscriptionConfig(
        sentiment_analysis=True,
        entity_detection=True,  # Identifies important words/names
        auto_chapters=False  # (Set to True if you want topic segmentation)
    )

    # Start transcription with AI analysis
    transcript = transcriber.transcribe(file_path, config=config)

    # Wait for the result
    print("Processing transcription & AI analysis...")
    while transcript.status not in ["completed", "failed"]:
        time.sleep(5)
        transcript = transcript.get()  # Get updated status

    # Check result
    if transcript.status == "completed":
        return transcript
    else:
        return None

def count_filler_words(text):
    words = re.findall(r"\b\w+\b", text.lower())  # Tokenize words
    filler_counts = Counter(word for word in words if word in FILLER_WORDS)
    total_filler_count = sum(filler_counts.values())
    return filler_counts, total_filler_count

def generate_suggestions(sentiment_data, total_filler_count):
    suggestions = []

    # Analyze Sentiment Distribution
    positive_count = sum(1 for s in sentiment_data if s.sentiment == "POSITIVE")
    negative_count = sum(1 for s in sentiment_data if s.sentiment == "NEGATIVE")
    neutral_count = sum(1 for s in sentiment_data if s.sentiment == "NEUTRAL")

    total_segments = positive_count + negative_count + neutral_count
    if total_segments > 0:
        positivity_ratio = positive_count / total_segments
        negativity_ratio = negative_count / total_segments

        # Determine Overall Tone
        if positivity_ratio > 0.6:
            overall_tone = "Positive"
        elif negativity_ratio > 0.4:
            overall_tone = "Negative"
        else:
            overall_tone = "Neutral"

        suggestions.append(f"Overall tone detected: {overall_tone}.")
    else:
        overall_tone = "Unknown"
        suggestions.append("Tone could not be determined due to lack of detected sentiment.")

    # Suggest reducing filler words
    if total_filler_count > 5:
        suggestions.append(f"Consider reducing filler words ('um', 'uh', 'like', etc.) to sound more confident.")

    # Encourage structured speaking
    if negativity_ratio > 0.4:
        suggestions.append("Try to reframe negative statements into constructive feedback.")

    # General communication tips
    suggestions.append("Practice pausing instead of using filler words for better clarity.")

    return overall_tone, suggestions

if __name__ == "__main__":
    # Ask user for a file input (MP4, MP3, WAV)
    file_path = input("Enter the file name (MP4, MP3, or WAV): ").strip()

    # Check if file exists
    if not os.path.isfile(file_path):
        print(f"Error: File '{file_path}' not found.")
        exit(1)

    # Transcribe and analyze audio
    transcript_data = analyze_transcription(file_path)

    if transcript_data:
        transcription_text = transcript_data.text
        sentiment_data = transcript_data.sentiment_analysis
        filler_counts, total_filler_count = count_filler_words(transcription_text)  # Manual filler word detection
        word_count = len(transcription_text.split())

        # Calculate transcription length (in seconds)
        transcription_length = transcript_data.audio_duration

        # Generate suggestions
        overall_tone, suggestions = generate_suggestions(sentiment_data, total_filler_count)

        # Print results
        print("\n🔹 **Transcribed Text:**\n", transcription_text)
        print("\n🔹 **Transcription Length:**", f"{transcription_length:.2f} seconds")
        print("🔹 **Word Count:**", word_count)
        print("🔹 **Total Filler Words Detected:**", total_filler_count)
        print("🔹 **Filler Word Breakdown:**")
        for word, count in filler_counts.items():
            print(f"   ➡️ {word}: {count}")

        print("🔹 **Overall Tone:**", overall_tone)

        # Print Sentiment Analysis
        print("\n🔹 **Sentiment Analysis:**")
        for result in sentiment_data:
            print(f"🔹 Text: {result.text}")
            print(f"   ➡️ Sentiment: {result.sentiment} (Confidence: {result.confidence:.2f})\n")

        # Print Suggestions
        print("\n🔹 **Suggestions for Improvement:**")
        for suggestion in suggestions:
            print(f"   ➡️ {suggestion}")

    else:
        print("Error: Transcription failed.")

