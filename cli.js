#!/usr/bin/env node

const { program } = require("commander");
const bip39 = require('bip39');
const crypto = require("crypto");
const { mnemonicAddrs, mnemonicAddrsEthBtc, mnemonicKeysEthBtc } = require('./api');
const qrcode = require('qrcode-terminal');

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
  .option("-c, --command <type>", "Command: 'entropy' to convert entropy. 'random' to generate random mnemonics, 'addr': to print addresses, 'wallet': to print wallets ")
  .option("-k, --key <type>", "The key to be converted. A mnemonics or an entropy")
  .option("-n, --number <type>", "Number of items to display")
  .option("--qr <type>", "Type of QR code")
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
        const mn2Txt = mn2.join(' ');
        console.log(mnemonicAddrs(mn2Txt));
        const [addrEth, addrBtc] = mnemonicAddrsEthBtc(mn2Txt);
        if (options.qr === 'eth') {
          qrcode.generate(addrEth);
        } else if (options.qr === 'btc') {
          qrcode.generate(addrBtc);
        } else if (!!options.qr) {
          console.log('INVALID OPTION --qr', options.qr)
        }
        // qrcode.generate(addrBtc);
        break;
      case "wallet":
        const [isMn3, mn3] = keyIsMn(options.key);
        if (!isMn3) { 
          console.log('Key must be mnemonics');
          return -1;
        }
        const mn3Txt = mn3.join(' ');
        const count = options.number || 1;
        {
          let [addrEth, addrBtc] = mnemonicAddrsEthBtc(mn3Txt, count);
          let [keyEth, keyBtc] = mnemonicKeysEthBtc(mn3Txt, count);
          keyEth = keyEth.privateKey.toString('hex');
          keyBtc = keyBtc.privateKey.toString('hex');
          if (options.qr === 'eth') {
            console.log('WALLET # ', count)
            console.log(addrEth);
            console.log('NOTE: BELOW IS YOUR PRIVATE KEY - KEEP IT SUPER SAFE')
            console.log(keyEth);
            qrcode.generate(keyEth);
          } else if (options.qr === 'btc') {
            console.log('WALLET # ', count)
            console.log(addrBtc);
            console.log('NOTE: BELOW IS YOUR PRIVATE KEY - KEEP IT SUPER SAFE')
            console.log(keyBtc);
            qrcode.generate(keyBtc);
          } else {
            console.log('INVALID OPTION --qr', options.qr || '[REQUIRED]')
          }
        }
        break;
      default:
        console.log("Unknown command");
    }
  });

program.parse(process.argv);
