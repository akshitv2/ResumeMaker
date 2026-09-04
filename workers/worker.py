from js import Response, fetch
import json
import urllib.parse
import os

# Read the template file bundled with the worker on startup
TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "sample_resume.md")

try:
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        SAMPLE_RESUME_TEMPLATE = f.read()
except Exception:
    # Fallback placeholder if local file read path varies by runtime
    SAMPLE_RESUME_TEMPLATE = ""

async def on_fetch(request, env):
    url = request.url

    # 1. Serve the MS Word-styled UI (Only requires Applicant & JD)
    if request.method == "GET" and not url.endswith("/generate"):
        html = """<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume Generator</title>
            <style>
                body { font-family: 'Segoe UI', Calibri, sans-serif; background-color: #F3F2F1; margin: 0; padding: 0; }
                .ribbon { background-color: #2B579A; color: white; padding: 12px 24px; font-size: 16px; font-weight: 500; display: flex; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
                .ribbon span { margin-left: 15px; font-size: 14px; opacity: 0.8; }
                .page { max-width: 8.5in; margin: 40px auto; background: white; padding: 1in; box-shadow: 0 2px 10px rgba(0,0,0,0.15); border: 1px solid #D2D2D2; }
                .form-group { margin-bottom: 25px; }
                label { display: block; font-weight: 600; margin-bottom: 8px; color: #444; font-size: 14px; }
                textarea { width: 100%; height: 160px; padding: 12px; border: 1px solid #C8C6C4; font-family: 'Segoe UI', Calibri, sans-serif; font-size: 14px; resize: vertical; box-sizing: border-box; background-color: #FAFAFA; }
                textarea:focus { border-color: #2B579A; outline: none; background-color: #FFF; box-shadow: inset 0 0 0 1px #2B579A; }
                .btn { background-color: #2B579A; color: white; border: none; padding: 10px 24px; cursor: pointer; font-size: 14px; border-radius: 2px; font-weight: 600; }
                .btn:hover { background-color: #1E3E6D; }
                .btn:disabled { background-color: #A0AABF; cursor: not-allowed; }
                #status { margin-top: 15px; font-size: 14px; color: #2B579A; font-weight: 500; display: none; }
            </style>
        </head>
        <body>
            <div class="ribbon">Document 1 - Word <span>File | Home | Insert | Generate</span></div>
            <div class="page">
                <form id="resumeForm">
                    <div class="form-group">
                        <label for="applicant">Applicant Details (Experience, Skills, Background)</label>
                        <textarea id="applicant" required placeholder="Paste applicant data here..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="jd">Target Job Description</label>
                        <textarea id="jd" required placeholder="Paste the Job Description here..."></textarea>
                    </div>
                    <button type="submit" class="btn" id="submitBtn">Generate & Open in New Tab</button>
                    <div id="status">Processing document... please wait.</div>
                </form>
            </div>
            <script>
                document.getElementById('resumeForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const btn = document.getElementById('submitBtn');
                    const status = document.getElementById('status');
                    btn.disabled = true;
                    status.style.display = 'block';
                    
                    const payload = {
                        applicant: document.getElementById('applicant').value,
                        jd: document.getElementById('jd').value
                    };
                    
                    try {
                        const res = await fetch('/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        
                        const data = await res.json();
                        
                        if (res.ok && data.url) {
                            window.open(data.url, '_blank');
                            status.innerText = "Document generated successfully.";
                        } else {
                            status.innerText = 'Error: ' + (data.error || 'Unknown error occurred.');
                            status.style.color = 'red';
                        }
                    } catch (err) {
                        status.innerText = 'Request failed. Check network connection.';
                        status.style.color = 'red';
                    } finally {
                        btn.disabled = false;
                    }
                });
            </script>
        </body>
        </html>"""
        return Response.new(html, headers={"Content-Type": "text/html"})

    # 2. Handle API request using the static template
    if request.method == "POST" and url.endswith("/generate"):
        try:
            body_text = await request.text()
            body_json = json.loads(body_text)

            applicant = body_json.get("applicant", "")
            jd = body_json.get("jd", "")

            api_key = getattr(env, "GEMINI_API_KEY", None)
            if not api_key:
                return Response.new(json.dumps({"error": "GEMINI_API_KEY secret is not set."}), status=500)

            prompt = f"""You are an expert ATS-friendly resume creator bot. You are provided with a sample resume template, applicant details, and a targeted Job Description.

Job Description:
{jd}

Task Instructions:
1. Extract and analyze the applicant's experience, skills, and background.
2. Select all experiences, skills, and projects that align directly with the target Job Description.
3. Include essential general achievements and foundational technical/professional details to ensure a well-rounded resume.
4. Strategically tailor and rephrase experience points using action verbs and domain-specific keywords from the Job Description, ensuring all additions remain realistic for the candidate's actual experience level.
5. Quantify achievements with realistic metrics (e.g., percentages, scale, time saved, revenue) across key bullet points to maximize impact.
6. Strictly format the final output using the layout and Markdown structure provided in the template.
7. Format the final output to meet ATS requirements as well as perform on keyword matching.

Output Constraint: Return ONLY the final formatted Markdown resume. Do NOT include any introductory text, explanations, or surrounding Markdown code block fences (```md).
The <left><right> custom tags in the md file need to exist together on same line. If you create one make sure to create the other even if it is blank.
Target the resume to fit in one A4 page."""

            gemini_payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {"text": f"Applicant Details:\n{applicant}"},
                        {"text": f"Sample Resume Template:\n{SAMPLE_RESUME_TEMPLATE}"}
                    ]
                }]
            }

            gemini_url = f"[https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=){api_key}"

            import pyodide.ffi
            fetch_options = pyodide.ffi.to_js({
                "method": "POST",
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(gemini_payload)
            })

            gemini_response = await fetch(gemini_url, fetch_options)
            gemini_data = await gemini_response.json()
            gemini_dict = gemini_data.to_py()

            if "error" in gemini_dict:
                return Response.new(json.dumps({"error": gemini_dict["error"]["message"]}), status=400)

            generated_text = gemini_dict["candidates"][0]["content"]["parts"][0]["text"]
            encoded_content = urllib.parse.quote(generated_text, safe="")
            target_url = f"[https://akshitv2.github.io/ResumeMaker?md=](https://akshitv2.github.io/ResumeMaker?md=){encoded_content}"

            return Response.new(json.dumps({"url": target_url}), headers={"Content-Type": "application/json"})

        except Exception as e:
            return Response.new(json.dumps({"error": str(e)}), status=500)

    return Response.new("Not Found", status=404)