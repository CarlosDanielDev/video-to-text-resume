
import { exec } from 'node:child_process';
import dotenv from 'dotenv'

dotenv.config()

exec(`ffmpeg -i ${process.env.VIDEO_PATH} -vn -acodec copy ${process.env.AUDIO_FILENAME}`, (error) => {
  if (error) {
    console.error(`Error on extract audio: ${error}`);
    process.exit(1)
  }
  console.log('Success!');

});
