/* eslint-disable no-plusplus */
const { Buffer } = require('buffer');
const { getByte, savefile, asyncShellExec } = require('./utils.js');

const reads = [
  ['ChunkID', 'uinteger', 4],
  ['ChunkSize', 'uinteger', 4],
  ['Format', 'uinteger', 4],
  ['Subchunk1ID', 'uinteger', 4],
  ['Subchunk1Size', 'uinteger', 4],
  ['AudioFormat', 'integer', 2],
  ['NumChannels', 'integer', 2],
  ['SampleRate', 'uinteger', 4],
  ['ByteRate', 'uinteger', 4],
  ['BlockAlign', 'integer', 2],
  ['BitsPerSample', 'integer', 2],
  ['Subchunk2ID', 'uinteger', 4],
  ['Subchunk2Size', 'uinteger', 4],
];
function readWav(buffer) {
  return readWavQueue(buffer);
}
function readWavQueue(buffer, pointer = 0, i = 0, readResult = {}) {
  const read = reads[i];
  i++;
  if (read[1] === 'string') {
    readResult[read[0]] = buffer.toString('ascii', pointer, pointer + read[2]);
    pointer += read[2];
  } else if (read[1] === 'integer') {
    readResult[read[0]] = buffer.readUInt16LE(pointer, read[2]);
    pointer += read[2];
  } else if (read[1] === 'uinteger') {
    readResult[read[0]] = buffer.readInt32LE(pointer, read[2]);
    pointer += read[2];
  }
  if (i < reads.length) {
    return readWavQueue(buffer, pointer, i, readResult);
  }
  return readResult;
}
function writeWav(buffer, readResult, pointer = 0, i = 0) {
  const read = reads[i];

  i++;
  if (read[1] === 'integer') {
    buffer.writeUInt16LE(readResult[read[0]], pointer);
    pointer += read[2];
  } else if (read[1] === 'uinteger') {
    buffer.writeInt32LE(readResult[read[0]], pointer);
    pointer += read[2];
  }
  if (i < reads.length) {
    return writeWav(buffer, readResult, pointer, i);
  }
  return buffer;
}
async function addBackgroundMusic(fileInput, fileBackground, fileNameMusicOut) {
  // let {code, stdout } = await asyncShellExec(`ffmpeg -i ${fileInput} -i ${fileBackground}  -filter_complex amerge -ac 1 -c:a libmp3lame -q:a 4 ${fileNameMusic}`);
  const fileNameMusic = fileNameMusicOut;
  const command = `ffmpeg -y -i ${fileInput} -stream_loop -1  -i ${fileBackground} -filter_complex amerge -c:a libmp3lame -q:a 4 -ar 48000  ${fileNameMusic}`;
  console.log(command);
  const { code, stdout } = await asyncShellExec(command);
  console.log({ code, stdout });
  return { code, msg: stdout, path: fileNameMusic };
}
function concatWav(wavsInput) {
  const readResult = readWav(wavsInput[0]);
  console.log(JSON.stringify(readResult));
  const Subchunk2Size = readResult.Subchunk2Size * wavsInput.length;
  const bufSize = Buffer.alloc(4);
  try {
    bufSize.writeInt32LE(Subchunk2Size, 0);
  } catch (e) {
    console.log('writeInt32 out of range');
    console.log(e.message);
    bufSize.writeInt32LE(readResult.Subchunk2Size, 0);
  }
  const bytesReturn = Buffer.concat([
    wavsInput[0].slice(0, 40),
    bufSize,
    ...wavsInput.map(e => e.slice(44)),
  ]);
  return bytesReturn;
}
async function concatByLink({ links, directory }) {
  // const listByteArray = await Promise.all(links.map(link => getByte(link)));
  const listByteArray = [];
  for (const link of links) {
    const byte = await getByte(link);
    listByteArray.push(byte);
  }

  const bytes = concatWav(listByteArray);
  const result = await savefile(bytes, directory);
  return result;
}

module.exports = {
  concatByLink,
  writeWav,
  readWav,
  addBackgroundMusic,
  concatWav,
};
