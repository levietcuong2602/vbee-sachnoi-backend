/* eslint-disable func-names */
/* eslint-disable no-return-await */
/* eslint-disable no-undef */
/* eslint-disable no-buffer-constructor */
/* eslint-disable no-bitwise */
/* eslint-disable default-case */
/* eslint-disable no-plusplus */
const fs = require('fs');
// const moment = require('moment');
// const audioconcat = require('audioconcat');
const util = require('util');
const crypto = require('crypto');
const fetch = require('node-fetch');
const urlencode = require('urlencode');
const shell = require('shelljs');

const { MAX_LEN_SPLIT_BLOCK } = process.env;

const readFile = util.promisify(fs.readFile);
async function post(
  url,
  body = '',
  headers = { 'Content-Type': 'application/x-www-form-urlencoded' },
  method = 'POST',
) {
  const data = await fetch(url, {
    method,
    headers,
    body,
  }).then(res => res.text());
  return data;
}

function urlencodeData(newJson = {}) {
  return Object.keys(newJson)
    .map(x => {
      return `${x}=${urlencode(newJson[x])}`;
    })
    .join('&');
}

async function getByte(
  url,
  headers = { 'Content-Type': 'application/x-www-form-urlencoded' },
) {
  console.log(`get byte: ${url}`);
  const data = await fetch(url, {
    headers,
    method: 'GET',
  })
    .then(res => res.buffer())
    .catch(error => {
      console.log('error', error);
      return '';
    });
  return data;
}

async function asyncShellExec(command) {
  return new Promise(resolve =>
    shell.exec(command, function(code, stdout, stderr) {
      resolve({
        code,
        stdout,
        stderr,
      });
    }),
  );
}

async function addfile(content, filename) {
  return new Promise((resolve, reject) => {
    fs.appendFile(filename, `${content}\n`, function(err) {
      if (err) {
        resolve(filename);
      } else {
        resolve(filename);
      }
    });
  });
}

function matchAll(re, data, count = 1) {
  let m;
  const l = [];
  do {
    m = re.exec(data);
    if (m) {
      let s = '';
      for (let i = 0; i < count; i++) {
        s += `${m[i + 1]}|`;
      }
      l.push(s.slice(0, s.length - 1));
    }
  } while (m);
  return l;
}

async function savefileText(content, fileTyoe = 'wav') {
  const fileSave = generateUuid();
  return new Promise((resolve, reject) => {
    fs.writeFile(
      `${PATH_UPLOAD}/${fileSave}.${fileTyoe}`,
      `${content}\n`,
      function(err) {
        if (err) {
          console.log('save file error ', err);
          return console.log(err);
        }
        return resolve(`${PATH_UPLOAD}/${fileSave}.${fileTyoe}`);
        // console.log("save file done ", `${PATH_UPLOAD}/${fileSave}.${fileTyoe}`)
      },
    );
  });
}

async function savefile(content, fullFile) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${fullFile}`, content, err => {
      if (err) {
        console.log('save file error ', err);
      }
      resolve(`${fullFile}`);
      // console.log("save file done ", `${PATH_UPLOAD}/${fileSave}.${fileTyoe}`)
    });
  });
}

const joinFiles = async fileConcat => {
  const fileOutput = generateUuid();
  const proc = new ffmpeg();
  fileConcat.map(e => proc.mergeAdd(e));
  proc.mergeToFile(
    `${PATH_UPLOAD}/${fileOutput}.wav`,
    `${PATH_UPLOAD}`,
    function() {
      console.log('files has been merged succesfully');
    },
  );
  return await new Promise((resolve, reject) => {
    proc
      .on('start', function(command) {
        console.log('ffmpeg process started:', command);
      })
      .on('error', function(err, stdout, stderr) {
        console.error('Error:', err);
        console.error('ffmpeg stderr:', stderr);
      })
      .on('end', function(output) {
        resolve(`/home/tts/server/uploads/${fileOutput}.wav`);
      });
  });
};

function utf8toAnsi(text) {
  if (text === null || text === undefined) return text;

  text = text.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự/g, 'u');
  text = text.replace(
    /á|à|ả|ã|ạ|ă|ắ|ặ|ằ|ẳ|ẵ|â|ấ|ầ|ẩ|ẫ|ậ|Á|À|Ả|Ã|Ạ|Ă|Ắ|Ặ|Ằ|Ẳ|Ẵ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ/g,
    'a',
  );
  text = text.replace(/đ|Đ/g, 'd');
  text = text.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ/g, 'e');
  text = text.replace(/í|ì|ỉ|ĩ|ị|Í|Ì|Ỉ|Ĩ|Ị/g, 'i');
  text = text.replace(
    /ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ/g,
    'o',
  );
  text = text.replace(/ý|ỳ|ỷ|ỹ|ỵ|Ý|Ỳ|Ỷ|Ỹ|Ỵ/g, 'y');
  return text;
}

function Utf8ArrayToStr(array) {
  let out;
  let i;
  const len = array.length;
  let c;
  let char2;
  let char3;

  out = '';
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0),
        );
        break;
    }
  }
  return out;
}

function generateUuid() {
  const d = new Date();

  return `${d.getTime()}${Math.random().toString()}${Math.random().toString()}${Math.random().toString()}`;
}

function genRsaKey() {
  const primeLength = 512;
  const diffHell = crypto.createDiffieHellman(primeLength);

  diffHell.generateKeys('base64');
  console.log('Public Key : ', diffHell.getPublicKey('base64'));
  console.log('Private Key : ', diffHell.getPrivateKey('base64'));
  return {
    publicKey: diffHell.getPublicKey('base64'),
    privateKey: diffHell.getPrivateKey('base64'),
  };
}

function encryptStringWithRsaPrivateKey(toEncrypt, privateKey) {
  const buffer = new Buffer(toEncrypt);
  const encrypted = crypto.publicEncrypt(privateKey, buffer);
  return encrypted.toString('base64');
}

function decryptStringWithRsaPublicKey(toDecrypt, publicKey) {
  const buffer = new Buffer(toDecrypt, 'base64');
  const decrypted = crypto.privateDecrypt(publicKey, buffer);
  return decrypted.toString('utf8');
}

function splitText(inputText) {
  let tmp = '';
  const listText = [];
  const texts = inputText.split('.');
  texts.forEach((text, index) => {
    tmp = `${tmp}${text}.`;
    if (index >= texts.length - 1) {
      listText.push(tmp.slice(0, tmp.length - 1));
    } else if (tmp.length + texts[index + 1].length > MAX_LEN_SPLIT_BLOCK) {
      listText.push(tmp.trim());
      tmp = '';
    }
  });
  return listText.filter(text => text.length > 0);
}

module.exports = {
  post,
  getByte,
  urlencodeData,
  asyncShellExec,
  splitText,
  matchAll,
  addfile,
  readFile,
  utf8toAnsi,
  savefileText,
  genRsaKey,
  savefile,
  joinFiles,
  generateUuid,
  Utf8ArrayToStr,
  encryptStringWithRsaPrivateKey,
  decryptStringWithRsaPublicKey,
};
