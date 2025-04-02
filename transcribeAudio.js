import { spawn } from 'node:child_process';
import fs from 'node:fs';
import ora from 'ora';
import ProgressBar from 'progress';
import dotenv from 'dotenv'

dotenv.config()

const audioFile = process.env.AUDIO_FILENAME;
const outputDir = '.';

const spinner = ora('Init transcription...').start();

const bar = new ProgressBar('Transcripting [:bar] :percent | ETA: :etas', {
  total: 100,
  width: 30,
  complete: '=',
  incomplete: ' ',
});

let currentProgress = 0;

const progressInterval = setInterval(() => {
  const increment = Math.floor(Math.random() * 5);
  currentProgress += increment;
  if (currentProgress >= 100) {
    currentProgress = 99;
  }
  bar.update(currentProgress / 100);
  spinner.text = `Transcripting... ${currentProgress}% finished`;
}, 1000);

const whisperProcess = spawn('whisper', [
  audioFile,
  '--model', 'medium',
  '--language', process.env.LANGUAGE,
  '--output_format', 'txt',
  '--output_dir', outputDir
]);

whisperProcess.stdout.on('data', (data) => {
  const message = data.toString().trim();
  if (message) {
    const match = message.match(/(\d+)%/);
    if (match) {
      currentProgress = parseInt(match[1], 10);
      bar.update(currentProgress / 100);
      spinner.text = `Transcripting... ${currentProgress}% finished`;
    } else {
      spinner.text = `Transcripting: ${message}`;
    }
  }
});

whisperProcess.stderr.on('data', (data) => {
  const errorMsg = data.toString().trim();
  if (errorMsg) {
    spinner.text = `Waiting: ${errorMsg}`;
  }
});

whisperProcess.on('close', (code) => {
  clearInterval(progressInterval);
  bar.update(1);
  if (code === 0) {
    spinner.succeed('Transcription finished!');
    const generatedFile = process.env.EXTRACTED_AUDIO_FILENAME;
    const newFileName = process.env.TRANSCRIPTION_FILENAME;
    fs.rename(generatedFile, newFileName, (err) => {
      if (err) {
        console.error('Error on rename file:', err);
      } else {
        console.log(`Renamed file to ${newFileName}`);
      }
    });
  } else {
    spinner.fail(`Process finished with ${code}`);
  }
});

