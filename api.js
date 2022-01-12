const crypto = require("crypto");
const bip39 = require('bip39');

const pwHashLoop = 100000;

function hash(pw) {
    let h = crypto.createHash('sha256');
    h.update('PRE_' + pw + '_POST');
    return h.digest('hex');
}

function toPw(pw) {
    let h = crypto.createHash('sha256');
    h.update('PRE_' + pw + '_POST');
    for(let i=0; i<pwHashLoop; i++) {
        h.update('PRE_' + i.toString() + pw + i.toString() + '_POST')
    }
    return h.digest('hex');
}

function crypt(pw, mn, isEncrypt) {
    const pp = toPw(pw);
    console.log('Password after digest: ', pp);
    const msg = bip39.mnemonicToEntropy(mn);
    const b1 = Buffer.from(pp, 'hex');
    const b2 = Buffer.from(msg, 'hex');
    if (b1.length != 32 || b2.length != 32) {
        throw new Error('Both pw and mn must be 32 bytes');
    }
    var res = []
    for (var i = 0; i < b1.length; i++) {
       res.push(b1[i] ^ b2[i])
    }
    const rv = bip39.entropyToMnemonic(Buffer.from(res));
    if (!bip39.validateMnemonic(rv)) {
        throw new Error('Invalid mnemonic!');
    }
    return [rv, hash(isEncrypt ? mn : rv).substr(0,8)];
}

function toPwTest(pw) {
    return toPw('Some prefix ' + pw + ' Some post fix');
}

function verifyPw(pw, res) {
    const pp = toPwTest(pw);
    return pp === res;
}

function newMnemonic() {
    const sk = crypto.randomBytes(32).toString('hex');
    return bip39.entropyToMnemonic(sk);
}

module.exports = {
    verifyPw, crypt, toPwTest, newMnemonic,
}