import os
import requests
import base64
from urllib.parse import quote
import webbrowser

API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-3.5-flash"  # or gemini-2.5-pro

def file_to_inline_data(file_path: str, mime_type: str) -> dict:
    """Reads a file and converts it to Gemini's inlineData JSON structure."""
    with open(file_path, "rb") as f:
        encoded_string = base64.b64encode(f.read()).decode("utf-8")

    return {"inlineData": {"mimeType": mime_type, "data": encoded_string}}

url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

# Prepare the files
file1_data = file_to_inline_data("sample_data/applicant.txt", "text/plain")
file2_data = file_to_inline_data("sample_data/sample_resume.md", "text/markdown")

with open("sample_data/sample_jd.txt", "r", encoding="utf-8") as f:
    jd_text = f.read()

payload = {
    "contents": [
        {
            "parts": [
                {
                    "text": f'''You are an expert ATS-friendly resume creator bot. You are provided with a sample resume template (`sample_resume.md`), applicant details (`applicant.txt`), and a targeted Job Description.

Job Description:
{jd_text}

Task Instructions:
1. Extract and analyze the applicant's experience, skills, and background.
2. Select all experiences, skills, and projects that align directly with the target Job Description.
3. Include essential general achievements and foundational technical/professional details to ensure a well-rounded resume.
4. Strategically tailor and rephrase experience points using action verbs and domain-specific keywords from the Job Description, ensuring all additions remain realistic for the candidate's actual experience level.
5. Quantify achievements with realistic metrics (e.g., percentages, scale, time saved, revenue) across key bullet points to maximize impact.
6. Strictly format the final output using the layout and Markdown structure provided in `sample_resume.md`.
7. Format the final output to meet ATS requirements as well as perform on keyword matching.

Output Constraint: Return ONLY the final formatted Markdown resume. Do NOT include any introductory text, explanations, or surrounding Markdown code block fences (```md).
The <left><right> custom tags in the md file need to exist together on same line. If you create one make sure to create the other even if it is blank.
Target the resume to fit in one A4 page. For size reference the sample_resume provided fits in one page.

'''
                },
                file1_data,
                file2_data,
            ]
        }
    ]
}
headers = {"Content-Type": "application/json"}

# 1. Send the request
response = requests.post(url, headers=headers, json=payload)
response.raise_for_status()  # Raises an HTTPError if the status code is 4xx/5xx

response_data = response.json()

# 2. Extract the generated text
generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]

encoded_content = quote(generated_text, safe="")

# Insert it into the URL
url = f"https://akshitv2.github.io/ResumeMaker?md={encoded_content}"

# Open in the default browser
webbrowser.open(url)

print(url)