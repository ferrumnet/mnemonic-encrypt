// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

function clean(s) {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function validatePw(pw) {
    if (pw.length < 22) {
        throw new Error('PW length must be at least 22 - Choose your PW wisely!');
    }
}

const _id = id => document.getElementById(id);

// Encrypt
_id('btn-1').addEventListener('click', () => {
    try {
    const pw = clean(_id('pw-1').value);
    validatePw(pw);
    const mn = clean(_id('mnemonics-1').value);
    const pwTest = api.toPwTest(pw);
    const [newMn, chk] = api.crypt(pw, mn, true);
    _id('mnemonics-2').innerText = newMn;
    _id('pw-2').innerText = pwTest;
    _id('chk-1').innerText = chk;
    } catch(e) {
        console.error(e)
        alert(e.toString());
    }
});

// Decrypt
_id('btn-2').addEventListener('click', () => {
    try {
    const pw = clean(_id('pw-3').value);
    const mn = clean(_id('mnemonics-3').value);
    const chk = clean(_id('chk-2').value);
    const [newMn, actualChk] = api.crypt(pw, mn, false);
    if (chk && actualChk !== chk) {
        throw new Error('Checksome does not match. Make sure you have entered you PW and mnemonics correctly')
    }
    _id('mnemonics-4').innerText = newMn;
    } catch(e) {
        console.error(e)
        alert(e.toString());
    }
});

// Verify
_id('btn-3').addEventListener('click', () => {
    try {
    const pw = clean(_id('pw-4').value);
    const pwTest = clean(_id('pw-test-1').value);
    _id('pw-test-2').innerText = api.verifyPw(pw, pwTest);
    } catch(e) {
        console.error(e)
        alert(e.toString());
    }
});

function hideAllBut(id) {
    _id('op-1').style.display = 'none';
    _id('op-2').style.display = 'none';
    _id('op-3').style.display = 'none';
    _id(id).style.display = '';
}

_id('opt-btn-1').addEventListener('click', () => hideAllBut('op-1'));
_id('opt-btn-2').addEventListener('click', () => hideAllBut('op-2'));
_id('opt-btn-3').addEventListener('click', () => hideAllBut('op-3'));
hideAllBut('op-0');