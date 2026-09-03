# ResumeMaker

I need you to create a HTML page which converts md files to proper resumes.

Features I need from the Markdown-to-Resume Converter

* For the ui of the website itself copy Microsoft Word
* Dual-Pane Workspace: A split-screen interface with a dark-themed Markdown code editor on the left and a A4 rendered
  resume preview pane on the right.
* Live render vs Click to Render, supports both options selectable from dropdown
* Theme Selection: Make themes for the resume modular isolating the css for each theme so it is easy to swap one for another
* Themes: Create atleast 5 different formats for resume, and atleast one plain basic formal format
* Frontmatter & Comment Configuration: Parses configuration properties (such as font family, base sizes, margins,
  page dimensions, and line height) defined at the top of the Markdown text via YAML frontmatter (`---`) or HTML comment
  blocks (`<!-- -->`).
* Custom `<left>` and `<right>` Layout Tagging: Includes a built-in preprocessor that converts custom inline tags
  into flexbox rows, allowing users to easily align left- and right-side content on the same line (ideal for dates,
  locations, and job titles).
* LocalStorage Auto-Saving: Automatically caches the editor's text content locally in the browser so progress isn't
  lost on accidental refreshes
* If no resume in cache loads an external `resume.md` file by default on first load.
* Visual Page Break Overlay: Provides an optional, toggleable way to view page break on the resume wrapper
  representing standard A4 page limits (`297mm`) to help manage content layout.
* File Upload and Markdown Export: Supports uploading local `.md` files directly into the editor and downloading the
  edited content back as a Markdown file.
* Native PDF Printing & Print Optimization: supports a pdf print button which prints the pdf properly (i.e. the text is
  parseable and selectable) make sure it is not an image of the webpage