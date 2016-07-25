#!/usr/bin/env node
'use strict';

//const program = require('commander');
//program.version('0.1');
//program.parse(process.argv);

const spawn = require('child_process').spawn;
const git = spawn('git', ['for-each-ref', '--format=%(authorname)^~^%(refname:short)^~^%(committerdate:rfc2822)']);

git.stdout.on('data', (data) => {

    // console.log(`stdout: ${data}`);
    var lines = data.toString().split(/\r?\n/);
    lines.forEach((line) => {
	// console.log(`${line}\n`);
	var parts = line.split("~-~");
	parts.forEach((part) => {
	    console.log(`part: ${part}`);
	});
    });
    
});

git.stderr.on('data', (data) => {
    console.log(`Not a git repo`);
    process.exit(0);
});
