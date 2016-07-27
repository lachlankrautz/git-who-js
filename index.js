#!/usr/bin/env node
"use strict";

const moment  = require("moment");
const colors  = require("colors");
const day_90  = moment().subtract(90, "day");
const day_180 = moment().subtract(180, "day");
const child   = require("child_process");
const git     = child.spawn("git", [
    "for-each-ref",
    "--format=%(authorname)^~^%(refname:short)^~^%(committerdate:iso8601)",
    "refs/remotes/origin"
]);

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
function goodLine (line) {
    return line
        && !line.includes("origin/HEAD")
        && !line.includes("origin/master");
}
function makeBranch (line) {
    var parts = line.replace("origin/", "").split("^~^");
    this.max  = Math.max(this.max, parts[0].length);
    return {
        date:   moment(parts[2]),
        author: parts[0],
        name:   parts[1]
    };
}
function sortBranch (a, b) {
    var order = a.author.localeCompare(b.author);
    if (order == 0) {
        order = a.date > b.date;
    }
    return order;
}
function formatBranch (branch) {
    var gap  = " ".repeat(this.max - branch.author.length);
    var date = branch.date;
    return `[${get_coloured_date(date)}] ${branch.author}${gap} ${branch.name}`;
}

git.stdout.on("data", data => {
    var counter = {max: 0};
    var output  = data.toString()
                      .split(/\r?\n/)
                      .filter(goodLine)
                      .map(makeBranch, counter)
                      .sort(sortBranch)
                      .map(formatBranch, counter)
                      .join("\n");
    console.log(output);
});

git.stderr.on("data", () => {
    console.log(`Unable to display branches`);
    process.exit(0);
});
