from openai import OpenAI

# OpenAI API key setup
#OPENAI_API_KEY = ""
client = openai.OpenAI(api_key="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")

def analyze_speech(text):
    prompt = f"""
    Analyze the following speech transcript and return:
    1. A count of filler words (uh, um, like, you know).
    2. A comma-separated list of suggested improvements such as stronger action verbs and rephrases.

    Speech:
    {text}

    Format the response as JSON with keys "filler_word_count" and "suggestions".
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert speech analyzer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content  # Correct way to access response content

# Example usage

speech_text = """Um, so today I want to, like, talk about how we can, you know, improve our workflow. Uhh, we need to, um, focus on efficiency."""
analysis = analyze_speech(speech_text)

print(analysis)
