#!/usr/bin/env node
"use strict";

// Init
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

/**
 * Get coloured string for a date based on age
 *
 * @param   {Moment} date
 * @returns {String}
 */
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

/**
 * Is this line valid
 *
 * @param   {String} line
 * @returns {boolean}
 */
function validLine (line) {
    return line
        && !line.includes("origin/HEAD")
        && !line.includes("origin/master");
}

/**
 * Parse a string into a branch object
 *
 * @param   {String} line
 * @returns {Branch}
 */
function makeBranch (line) {
    var parts = line.replace("origin/", "").split("^~^");
    this.max  = Math.max(this.max, parts[0].length);
    return new Branch(
        moment(parts[2]),
        parts[0],
        parts[1]
    );
}

/**
 * Sort branches
 *
 * @param   {Branch} a
 * @param   {Branch} b
 * @returns {number}
 */
function sortBranch (a, b) {
    var order = a.author.localeCompare(b.author);
    if (order == 0) {
        order = a.date > b.date;
    }
    return order;
}

/**
 *
 * @param   {Number} max
 * @param   {Branch} branch
 * @returns {string}
 */
function formatBranch (max, branch) {
    var gap  = " ".repeat(max - branch.author.length);
    var date = branch.date;
    return `[${get_coloured_date(date)}] ${branch.author}${gap} ${branch.name}`;
}

/**
 * A Branch
 */
class Branch {
    constructor (date, author, name) {
        this.date   = date;
        this.author = author;
        this.name   = name;
    }
}

// Process git output
git.stdout.on("data", data => {
    var counter = {max: 0};
    var output  = data.toString()
                      .split(/\r?\n/)
                      .filter(validLine)
                      .map(makeBranch, counter)
                      .sort(sortBranch)
                      .map(formatBranch.bind({}, counter.max))
                      .join("\n");
    console.log(output);
});

// Process git error
git.stderr.on("data", () => {
    console.log(`Unable to display branches`);
    process.exit(0);
});
