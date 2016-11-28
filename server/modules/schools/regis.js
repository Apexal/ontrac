const regis = require('rhs-schedulejs'); // Who made this lovely package? 

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



module.exports = {
    parseSchedule: parseSchedule,
    getCoursesFromSchedule: getCoursesFromSchedule
};