# Swift’s portfolio

A responsive one-page portfolio built with plain HTML, CSS, and JavaScript. No build step, package install, backend, or paid hosting is needed.

## Preview locally

From this folder, run:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000` in a browser. Use a local server rather than opening `index.html` directly so the résumé availability check works correctly. Stop the server with Ctrl+C.

## Where files go

- Intro video: `video/intro.mp4`. The supplied video is already there. Replace that file with your approved final MP4 while keeping the name, or change the path in `index.html` and `main.js`. The video is muted, plays inline, and runs to completion before revealing the homepage. If it cannot load or play, the homepage opens. Visitors with reduced motion enabled go directly to the homepage.
- Résumé: `assets/resume.pdf`. Add your own PDF with that filename. The download button activates when it is present.
- Robot: `images/robot-cutout.webp` is the transparent, optimized guide asset. `images/1.png` remains the original reference.
- Content: edit the text, skills, and project cards in `index.html`. Search for `Edit skill names here` and `Edit project descriptions` to find the main editable lists. Change colors, spacing, and layout in `styles.css`; behavior is in `main.js`.

The project cards intentionally show draft descriptions and inactive link labels until you add verified details and URLs. Replace the preview blocks with screenshots when available.

## Robot guide animation assets

The scroll guide currently follows measured section targets, moves through the page in both scroll directions, and shows section speech bubbles. It uses the approved transparent still image because there is no articulated robot asset in this project. It does **not** animate or fake arm joints. `main.js` emits a `guideposechange` event with `travel`, `turn`, and `point` timing for a future animated asset.

To add genuine turns and pointing, provide **either**:

- One textured, rigged `.glb` of this exact robot with separate head/neck, both shoulders, elbows, and hands. Include clips for `travel_loop`, `turn_to_screen_right`, `raise_arm_point_right`, `point_hold`, and `idle` (names can differ if you provide a clip list). The content sits to the robot’s screen-right at every stop.
- Or transparent PNG/WebP frame sequences of this same robot at one camera angle, scale, and canvas size: `travel_loop`, `turn_to_screen_right`, `raise_arm_point_right`, `point_hold`, and `idle`. Supply the frame rate (24 fps preferred) and a consistent foot anchor so the robot does not jump between actions.

The opening MP4 and the single robot image do not contain movable joints or the missing poses.

## Publish at jasney.github.io

1. Sign in to the GitHub account `Jasney`.
2. Create a **public** repository named exactly `Jasney.github.io` (GitHub treats the account name case insensitively for the Pages URL).
3. Upload the **contents of this folder to the repository root**: `index.html`, `styles.css`, `main.js`, `favicon.svg`, `.nojekyll`, and the `images`, `video`, and `assets` folders. Add `assets/resume.pdf` when ready. Do not upload the enclosing `My portfolio` folder as an extra level.
4. In repository **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Wait for GitHub Pages to finish publishing, then open `https://jasney.github.io/`.

For later edits, commit and push the changed files to `main`. GitHub Pages republishes automatically. The site uses relative asset paths, so it also works from a repository project URL if needed.

## Details to add later

- Your preferred final bio and headline, if different from the current draft.
- A PDF résumé at `assets/resume.pdf`.
- Real descriptions, screenshots, technology tags, live URLs, and repository URLs for Farm Market Connect and Alliance Ice Cubes.
- Any additional social links you want to publish.

No qualifications, employers, dates, project results, or project URLs have been invented.
