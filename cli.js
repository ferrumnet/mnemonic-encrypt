#!/usr/bin/env node

const { program } = require("commander");
const bip39 = require('bip39');
const crypto = require("crypto");
const { mnemonicAddrs } = require('./api');

function keyIsMn(key) {
  if (!key) {
    console.log("Key is required");
    throw new Error('Key is required');
  }
  const mnemonics = key.split(' ').filter(k => !!k);
  if (mnemonics.length == 24 || mnemonics.length == 12) {
    return [true, mnemonics];
  }
  return [false, mnemonics];
}

program
  .version("1.0.0")
  .description("mnemonic-encrypt")
  .option("-c, --command <type>", "Command: 'entropy' to convert entropy. 'random' to generate random mnemonics, 'addr': to print addresses ")
  .option("-k, --key <type>", "The key to be converted. A mnemonics or an entropy")
  .action((options) => {
    switch(options.command) {
      case "random":
        const rs = crypto.randomBytes(32);
        const rn = bip39.entropyToMnemonic(rs);
        console.log('Random mnemonics:');
        console.log(rn);
        return;
      case "entropy":
        const [isMn, mnemonics] = keyIsMn(options.key);
        if (isMn) {
          const sk = bip39.mnemonicToEntropy(mnemonics.join(' '));
          console.log('Entrypy:');
          console.log(sk);
          return;
        }
        if (mnemonics.length !== 1 || (mnemonics[0].length !== 64 && mnemonics[0].length != 66)) {
          console.log('Unrecognized key. No mnemonic or entropy');
          return -1;
        }

        const sk = mnemonics[0].replace('0x', '').replace('0X', '');
        const mn = bip39.entropyToMnemonic(Buffer.from(sk, 'hex'));
        console.log('Mnemonics:');
        console.log(mn);
        break;
      case "addr":
        const [isMn2, mn2] = keyIsMn(options.key);
        if (!isMn2) { 
          console.log('Key must be mnemonics');
          return -1;
        }
        console.log(mnemonicAddrs(mn2.join(' ')));
        break;
      default:
        console.log("Unknown command");
    }
  });

program.parse(process.argv);
