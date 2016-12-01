function parseSchedule(content) {
    let scheduleObject = {};

    // Somehow parse the passed schedule data

    return scheduleObject;
}

function getDaySchedule(scheduleObject, date) {
    let periods = [];
    
    // Somehow get schedule on the date

    return periods;
}

function getCoursesFromSchedule(scheduleObject) {
    let courses = [];

    // Somehow get course names

    return courses;
}


/* The exports must contain at least:
   - A method for getting course names from a schedule
   - A method for returning a list of periods when given a date
*/
module.exports = {
    parseSchedule: parseSchedule,
    getCoursesFromSchedule: getCoursesFromSchedule,
    getDaySchedule: getDaySchedule
};