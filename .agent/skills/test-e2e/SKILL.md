---
name: test-e2e
description: Runs an autonomous browser-based E2E test for TalkLink (Register -> Create Room -> Chat).
---

# E2E Test Skill

This skill automates the End-to-End testing of the TalkLink application using the `browser_subagent`.

## Usage

Trigger this skill when the user asks to "test the app", "verify login", or "check if the chat works".

## Workflow Steps

1. **Check Environment**:
    - Ensure `node server/index.js` is running on port 3000.
    - Ensure `npm run client` is running on port 5173.
    - If not, start them in the background.

2. **Launch Browser Verification**:
    - Use `browser_subagent` to perform the following:
    - **Navigate** to `http://localhost:5173`.
    - **Sign Up**: Create a new random user (e.g., `test_user_[timestamp]@talklink.com`).
    - **Verify Dashboard**: Confirm redirection to the main page.
    - **Create Room**: Create a room named "Auto Test Room".
    - **Send Message**: Type and send a test message.
    - **Capture Success Proof**: Take a screenshot of the chat room.

3. **Report**:
    - Summarize the test results.
    - Provide the path to the screenshot.
    - If failed, provide logs and error screenshot.
