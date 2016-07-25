#!/usr/bin/env node
'use strict';

//const program = require('commander');
//program.version('0.1');
//program.parse(process.argv);

const spawn  = require('child_process').spawn;
const git    = spawn('git', [
    'for-each-ref',
    '--format=%(authorname)^~^%(refname:short)^~^%(committerdate:iso8601)',
    'refs/remotes/origin'
]);
const moment = require('moment');
const colors = require('colors');

var day_90  = moment();
var day_180 = moment();
day_90.subtract(90, "day");
day_180.subtract(180, "day");

function get_coloured_date (date) {
    var str = date.format("YYYY-MM-DD");
    if (date < day_180) {
	str = colors.red(str);
    }
    else if (date < day_90) {
	str = colors.yellow(str);
    } else {
	str = colors.green(str);
    }
    return str;
}

git.stdout.on('data', (data) => {

    var lines    = data.toString().split(/\r?\n/);
    var branches = [];
    var max      = 0;
    lines.forEach((line) => {
	if (!line || line.includes("origin/HEAD") || line.includes("origin/master")) {
	    return;
	}
	var parts = line.replace("origin/", "").split("^~^");
	branches.push({
	    date:   moment(parts[2]),
	    author: parts[0],
	    name:   parts[1]
	});
	max = Math.max(max, parts[0].length);
    });
    branches.sort((a, b) => {
	var order = a.author.localeCompare(b.author);
	if (order == 0) {
	    order = a.date > b.date;
	}
	return order;
    });
    branches.forEach((branch) => {
	var gap   = " ".repeat(max - branch.author.length);
	var date  = branch.date;
	var clean = `[${get_coloured_date(date)}] ${branch.author}${gap} ${branch.name}`;
	console.log(`${clean}`);
    });
});

git.stderr.on('data', (data) => {
    console.log(`Unable to display branches`);
    process.exit(0);
});
