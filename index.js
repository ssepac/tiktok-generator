import captureWebsite from "capture-website";
import { run } from "./reddit.js";
import fs from "fs";
import GTTS from "gtts";
import videoshow from "videoshow";
import * as mm from "music-metadata";
import { spawn } from "child_process";
import Jimp from "jimp";

(async () => {
  const config = {
    subreddit: "scarystories",
    assetsPicsDir: "scary",
  };
  const stories = await run(config.subreddit);

  await Promise.all(
    stories.map(async (story) => {
      const screenshotPicFile = `output/pics/pic_screenshot_${story.name}.png`;
      const screenshotWithBgFile = `output/pics/pic_output_${story.name}.png`;
      const inputAudioFile = `output/audio/audio_input_${story.name}.mp3`;
      const outputAudioFile = `output/audio/audio_output_${story.name}.mp3`;
      const outputVideoFile = `output/video/video_output${story.name}.mp4`;

      const getRandomFileFromDir = (subdir) => {
        function getRandomInt(max) {
          return Math.floor(Math.random() * max);
        }
        const len = fs.readdirSync(`assets/pics/${subdir}`).length;
        const randIndex = getRandomInt(len);
        return fs.readdirSync(`assets/pics/${subdir}`)[randIndex];
      };

      //capture picture
      await captureWebsite
        .file(story.link, screenshotPicFile, {
          element: `#${story.name}`,
        })
        .then(async () => {
          // Reading watermark Image
          let screenshot = await Jimp.read(screenshotPicFile);
          screenshot = await screenshot;
          const ssDimensions = {
            width: screenshot.getWidth(),
            height: screenshot.getHeight(),
          };
          // Reading original image
          const bg = await Jimp.read(
            `assets/pics/scary/${getRandomFileFromDir(config.assetsPicsDir)}`
          );
          bg.scaleToFit(ssDimensions.width, Jimp.AUTO, Jimp.RESIZE_BEZIER);
          const bgDimensions = { width: bg.getWidth(), height: bg.getHeight() };
          bg.composite(
            screenshot,
            0,
            bgDimensions.height / 2 - ssDimensions.height / 2,
            {
              mode: Jimp.BLEND_SOURCE_OVER,
              opacityDest: 1,
              opacitySource: 1,
            }
          );
          await bg.writeAsync(screenshotWithBgFile);
        });

      const gtts = new GTTS(story.text, "en");

      const createAudioPromise = () =>
        new Promise((resolve, reject) => {
          gtts.save(inputAudioFile, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          });
        });

      const createAudioDurationPromise = () =>
        new Promise(async (resolve, reject) => {
          try {
            const metadata = await mm.parseFile(inputAudioFile);
            /*             console.log(
              util.inspect(metadata, { showHidden: false, depth: null })
            ); */
            console.log(metadata.format.duration);
            resolve(metadata.format.duration);
          } catch (error) {
            console.error(error.message);
            reject(error);
          }
        });

      const mergeAudioPromise = (duration) =>
        new Promise(async (resolve, reject) => {
          // need to make sure this PATH variable is set!
          var cmd = "ffmpeg";

          var args = [
            "-i",
            inputAudioFile,
            "-i",
            "assets/audio/horror.mp3",
            "-filter_complex",
            "amix=inputs=2:duration=longest",
            outputAudioFile,
          ];

          var proc = spawn(cmd, args);

          proc.stdout.on("data", function (data) {
            console.log(data);
          });

          proc.stderr.setEncoding("utf8");
          proc.stderr.on("data", function (data) {
            console.log(data);
          });

          proc.on("error", function (err) {
            console.log(err);
            reject(err);
          });

          proc.on("close", function () {
            console.log("finished");
            resolve(duration);
          });
        });

      const createVideoPromise = (duration) =>
        new Promise((resolve, reject) => {
          const videoOptions = {
            aspect: "9:20", //Samsung S22 + iPhone is actually 19.5:9!
            fps: 25,
            loop: duration + 1.0, // an extra second added to curb off transition
            transition: false,
            videoBitrate: 1024,
            videoCodec: "libx264",
            size: "640x?",
            audioBitrate: "128k",
            audioChannels: 2,
            format: "mp4",
            pixelFormat: "yuv420p",
          };

          videoshow([screenshotWithBgFile], videoOptions)
            .audio(outputAudioFile)
            .save(outputVideoFile)
            .on("start", function (command) {
              console.log("ffmpeg process started:", command);
            })
            .on("error", function (err, stdout, stderr) {
              reject(err);
            })
            .on("end", function (output) {
              resolve(output);
            });
        });

      await createAudioPromise()
        .then(() => createAudioDurationPromise())
        .then((duration) => mergeAudioPromise(duration))
        .then((duration) => createVideoPromise(duration));
    })
  );
})();
