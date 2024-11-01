#!/usr/bin/env node

"use strict";

const fs = require('fs');

const logconv = require('./lib/logconv');

const argv = require('yargs')
    .usage('Usage: $0 paipu.json [ log-idx ]')
    .demandCommand(1)
    .argv;

let filename = argv._[0];
let log_idx  = argv._[1] && + argv._[1];

let paipu;
try {
    paipu = JSON.parse(fs.readFileSync(filename));
}
catch (e) {
    console.error(e.message);
    process.exit(-1);
}

let rv = JSON.stringify(logconv(paipu, log_idx));
if (log_idx != null)
        process.stdout.write('https://tenhou.net/6/#json='
                                            + encodeURI(rv) + '\n');
else    process.stdout.write(rv + '\n');
