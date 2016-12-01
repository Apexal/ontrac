const regis = require('rhs-schedulejs'); // Who made this lovely package? 
const moment = require('moment');

function parseSchedule(content) {
    const parse = regis(content)
    return {
        scheduleDays: parse.scheduleDays,
        classDays: parse.classDays   
    };
}

function getCoursesFromSchedule(scheduleObject) {
    let courses = [];
    /*
        {
            title: period.title,
            shortTitle: period.shortTitle
        }
    */

    for (let sd in scheduleObject.classDays) {
        // Loop through periods and add them if unique
        scheduleObject.classDays[sd].forEach((period) => {
            if (courses.filter((c) => c.title == period.title).length == 0) {
                courses.push({
                    title: period.title,
                    shortTitle: period.shortTitle
                });
            };
        });
    }

    return courses.sort((a,b) => { return a.title > b.title });
}

/* Returns an array of the user's classes on a certain date. */
function getDaySchedule(scheduleObject, date) {
    // Luckily this is easy for Regis
    const d = moment(date).startOf('day').toDate();
    if (d in scheduleObject.scheduleDays) {
        return scheduleObject.classDays[scheduleObject.scheduleDays[d]];
    } else {
        return [];
    }
}

module.exports = {
    parseSchedule: parseSchedule,
    getCoursesFromSchedule: getCoursesFromSchedule,
    getDaySchedule: getDaySchedule
};