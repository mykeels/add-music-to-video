const fs = require("fs");
const fg = require("fast-glob");
const path = require("path");
const FFMpeg = require("ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const getRandomMusic = require("get-random-music");
const { execSync } = require("child_process");

FFMpeg.bin = ffmpegPath;

const getRepeatedAudioPath = async (audioPath, duration) => {
  console.log("Expanding Music to fit video of", duration, "seconds");
  const audioRepeatCount = Math.ceil(duration / 15);
  const repeatInputFile = path
    .join(__dirname, "audio-repeat.txt")
    .replace(/\\/g, "\\\\");
  fs.writeFileSync(
    repeatInputFile,
    `file '${path.relative(__dirname, audioPath)}'\n`.repeat(audioRepeatCount),
    "utf8"
  );
  const audioDir = path.dirname(audioPath);
  const audioFilename = audioPath
    .replace(audioDir, "")
    .replace(path.delimiter, "")
    .replace(/\.\w+$/, "");
  const audioRepeatedFilePath = path.join(
    path.dirname(audioPath),
    `${audioFilename}_repeated_${duration}s.mp3`
  );
  execSync(
    `ffmpeg -y -t ${duration} -f concat -i ${repeatInputFile} -c copy ${audioRepeatedFilePath}`,
    {
      cwd: path.dirname(repeatInputFile),
    }
  );

  return audioRepeatedFilePath;
};

/**
 *
 * @param {number} duration
 * @returns {Promise<string>}
 */
const makeMusic = async (duration) => {
  console.log("Making Music");
  const musicFilePath = path.join(__dirname, "random-music.mp3");
  const outStream = fs.createWriteStream(musicFilePath);
  const downloadStream = await getRandomMusic().then((res) => res.data);
  await new Promise((resolve, reject) => {
    downloadStream.pipe(outStream);
    downloadStream.on("error", (error) => {
      console.error(error);
      downloadStream.close();
      reject();
    });
    downloadStream.on("close", () => {
      resolve(musicFilePath);
    });
  });

  return getRepeatedAudioPath(musicFilePath, duration);
};

const cleanupFiles = async () => {
  console.log("Cleaning up files");
  const files = await fg(["*.mp3", "*.txt"], {
    cwd: __dirname,
  });
  for (let file of files) {
    fs.rmSync(path.join(__dirname, file), { force: true });
    console.log("Removed", path.join(__dirname, file));
  }
};

/**
 *
 * @param {object} options
 * @param {string[]} options.argv
 * @param {boolean} options.help
 * @param {string} options.command
 */
const run = async (options) => {
  const file = options.argv?.join(" ");
  const allowedFormats = [".mp4"];
  if (!allowedFormats.some((format) => file.endsWith(format))) {
    console.error("Input file not matching allowedFormats", {
      allowedFormats,
      file,
    });
    process.exit(0);
  }
  console.log("Input:", file);
  const outDir = path.dirname(file);
  const filename = file
    .replace(outDir, "")
    .replace(path.delimiter, "")
    .replace(/\.\w+$/, "");

  const video = await new FFMpeg(file);
  const musicFilePath = await makeMusic(video.metadata.duration.seconds);
  const videoOutputFile = path.join(
    outDir,
    `${filename}_with_music.mp4`.replace(/ /g, "_")
  );

  execSync(
    `ffmpeg -y -i "${file}" -i "${musicFilePath}" -c:v copy -map 0:v:0 -map 1:a:0 -f mp4 "${videoOutputFile}"`
  );

  await cleanupFiles();
};

module.exports = run;
module.exports.run = run;
