
import { spawn } from 'node:child_process';

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath]);

    child.stdout.on('data', (data) => {
      console.log(`[${scriptPath}] stdout: ${data.toString()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[${scriptPath}] stderr: ${data.toString()}`);
    });

    child.on('close', (code) => {
      console.log(`[${scriptPath}] finished with ${code} code`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`The script ${scriptPath} has finished with ${code} code`));
      }
    });
  });
}

async function main() {
  try {
    console.log('Initializing audio extraction...');
    await runScript('extractAudio.js');

    console.log('Audio extraction finished. Initializing transcription...');
    await runScript('transcribeAudio.js');

    console.log('Transcription finished. Processing transcription...');
    await runScript('processTranscription.js');

    console.log('Pipeline finished successfully!');
  } catch (error) {
    console.error('An error on pipeline:', error);
  }
}

main();

