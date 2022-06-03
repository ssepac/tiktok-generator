# tiktok-generator
Generates TikTok videos by doing the following:
- Downloads best Reddit content on X subreddit
    - This content contains a screenshot of the post as well
- Merges the screenshot with a background of choice
- Generates text-to-speech with the the content of the reddit post
- Merges the TTS with background music
- Combines all of this with FFMPEG and creates an mp4.

## Running
- Make sure you have FFMPEG downloaded and in your `PATH` environment variable.
- Change the subreddit you'd like to poll, and your background image + background music
- Run `npm start`