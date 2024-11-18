#!/usr/bin/env node

const { program } = require("commander");
const bip39 = require('bip39');
const crypto = require("crypto");

program
  .version("1.0.0")
  .description("mnemonic-encrypt")
  .option("-c, --command <type>", "Command: 'entropy' to convert entropy. 'random' to generate random mnemonics ")
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
        if (!options.key) {
          console.log("Key is required");
          return -1;
        }
        const key = options.key;
        const mnemonics = key.split(' ').filter(k => !!k);
        if (mnemonics.length == 24 || mnemonics.length == 12) {
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
      default:
        console.log("Unknown command");
    }
  });

program.parse(process.argv);
