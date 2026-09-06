const SAMPLE_RESUME_TEMPLATE = `<!--
font-size: 9pt
-->

# Alex Johnson

**Software Engineer** <left>San Francisco, CA, USA</left> <right>[alex.johnson@example.com](mailto:alex.johnson@example.com)</right> <left>[LinkedIn](https://www.linkedin.com/in/alexjohnson)</left><right>[GitHub](https://github.com/alexjohnson)</right>

## Professional Summary

Results-driven Software Engineer with 3+ years of experience building scalable web applications and backend services. Strong in Python, JavaScript, React, and REST APIs, with a focus on clean code, performance, and reliable delivery.

## Technical Skills

* **Languages:** Python, JavaScript, TypeScript, SQL
* **Frontend:** React, HTML, CSS, Tailwind CSS
* **Backend:** FastAPI, Node.js, REST APIs
* **Databases:** PostgreSQL, MySQL, Redis
* **Cloud & DevOps:** AWS, Docker, GitHub Actions
* **Tools:** Git, Linux, Postman, Jira

## Work Experience

### Software Engineer — TechNova Solutions

<left>San Francisco, CA, USA</left> <right>*July 2023 – Present*</right>

* Developed and maintained REST APIs using Python and FastAPI for customer-facing applications.
* Built reusable React components and improved frontend performance across major product workflows.
* Optimized PostgreSQL queries, reducing average API response time by approximately 30%.
* Added automated testing and CI/CD workflows, improving deployment reliability.
* Collaborated with product managers, designers, and QA engineers in an Agile development environment.

### Junior Software Developer — CodeSphere Technologies

<left>Chicago, IL, USA</left> <right>*June 2022 – June 2023*</right>

* Implemented backend features and integrations for internal business applications.
* Created SQL queries and database procedures for reporting and operational workflows.
* Fixed production issues and contributed to code reviews and technical documentation.
* Participated in sprint planning, daily stand-ups, and release activities.

## Projects

### E-Commerce Analytics Dashboard

* Built a responsive analytics dashboard using React, TypeScript, and REST APIs.
* Added interactive sales, inventory, and customer metrics.
* Implemented role-based access and PostgreSQL-backed reporting APIs.

### Task Management API

* Designed a RESTful task management service using FastAPI and PostgreSQL.
* Added JWT authentication, validation, pagination, and automated tests.
* Containerized the application with Docker for consistent development and deployment.

## Education

### Bachelor of Science in Computer Science

**University of Illinois Chicago**
2022

## Certifications

* AWS Certified Cloud Practitioner — 2025
* Python Programming Certificate — 2024

## Achievements

* Received the **Engineering Excellence Award** for improving API performance and reliability.
* Mentored two junior developers on Python, Git, and API development.`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. Serve the MS Word-styled UI
        if (request.method === "GET" && url.pathname === "/") {
            const html = `<!DOCTYPE html>
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
              input[type="password"], input[type="text"] { width: 100%; padding: 12px; border: 1px solid #C8C6C4; font-family: 'Segoe UI', Calibri, sans-serif; font-size: 14px; box-sizing: border-box; background-color: #FAFAFA; }
              input[type="password"]:focus, input[type="text"]:focus { border-color: #2B579A; outline: none; background-color: #FFF; box-shadow: inset 0 0 0 1px #2B579A; }
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
                      <label for="accessToken">Gemini API Key / Access Token</label>
                      <input type="password" id="accessToken" placeholder="Enter your Gemini API Key or Token (optional if server key set)">
                  </div>
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
              const tokenInput = document.getElementById('accessToken');
              const applicantInput = document.getElementById('applicant');
              const jdInput = document.getElementById('jd');

              // Load saved values from localStorage
              tokenInput.value = localStorage.getItem('resume_access_token') || '';
              applicantInput.value = localStorage.getItem('resume_applicant') || '';
              jdInput.value = localStorage.getItem('resume_jd') || '';

              // Persist changes as user types
              tokenInput.addEventListener('input', () => localStorage.setItem('resume_access_token', tokenInput.value));
              applicantInput.addEventListener('input', () => localStorage.setItem('resume_applicant', applicantInput.value));
              jdInput.addEventListener('input', () => localStorage.setItem('resume_jd', jdInput.value));

              document.getElementById('resumeForm').addEventListener('submit', async (e) => {
                  e.preventDefault();
                  const btn = document.getElementById('submitBtn');
                  const status = document.getElementById('status');
                  btn.disabled = true;
                  status.style.display = 'block';
                  status.innerText = 'Processing document... please wait.';
                  status.style.color = '#2B579A';
                  
                  const payload = {
                      accessToken: tokenInput.value.trim(),
                      applicant: applicantInput.value,
                      jd: jdInput.value
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
      </html>`;

            return new Response(html, {
                headers: { "Content-Type": "text/html;charset=UTF-8" }
            });
        }

        // 2. Handle API request
        if (request.method === "POST" && url.pathname === "/generate") {
            try {
                const { applicant, jd, accessToken } = await request.json();

                const apiKey = accessToken || env.GEMINI_API_KEY;

                if (!apiKey) {
                    return new Response(JSON.stringify({ error: "Gemini API Key / Access Token is required." }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                const prompt = `You are an expert ATS-friendly resume creator bot. You are provided with a sample resume template, applicant details, and a targeted Job Description.

Job Description:
${jd}

Task Instructions:
1. Extract and analyze the applicant's experience, skills, and background.
2. Select all experiences, skills, and projects that align directly with the target Job Description.
3. Include essential general achievements and foundational technical/professional details to ensure a well-rounded resume.
4. Strategically tailor and rephrase experience points using action verbs and domain-specific keywords from the Job Description, ensuring all additions remain realistic for the candidate's actual experience level.
5. Quantify achievements with realistic metrics (e.g., percentages, scale, time saved, revenue) across key bullet points to maximize impact.
6. Strictly format the final output using the layout and Markdown structure provided in the template.
7. Format the final output to meet ATS requirements as well as perform on keyword matching.

Output Constraint: Return ONLY the final formatted Markdown resume. Do NOT include any introductory text, explanations, or surrounding Markdown code block fences (\`\`\`md).
The <left><right> custom tags in the md file need to exist together on same line. If you create one make sure to create the other even if it is blank.
Target the resume to fit in one A4 page. For size reference the sample_resume provided fits in one page.`;

                const geminiPayload = {
                    contents: [{
                        parts: [
                            { text: prompt },
                            { text: `Applicant Details:\n${applicant}` },
                            { text: `Sample Resume Template:\n${SAMPLE_RESUME_TEMPLATE}` }
                        ]
                    }]
                };

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

                const geminiResponse = await fetch(geminiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(geminiPayload)
                });

                const geminiData = await geminiResponse.json();

                if (geminiData.error) {
                    return new Response(JSON.stringify({ error: geminiData.error.message }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                const generatedText = geminiData.candidates[0].content.parts[0].text;
                const encodedContent = encodeURIComponent(generatedText);
                const targetUrl = `https://akshitv2.github.io/ResumeMaker?md=${encodedContent}`;

                return new Response(JSON.stringify({ url: targetUrl }), {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        return new Response("Not Found", { status: 404 });
    }
};