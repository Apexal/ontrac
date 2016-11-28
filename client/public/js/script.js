let modules = [];

const PAGE = window.location.pathname;
const ORIGINALTITLE = $("title").text();

function Module(name, check, body) {
    if (!check()) return;

    modules.push({
        name: name,
        run: body
    });
}

$(() => {
    modules.sort(function(a, b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    });
    modules.forEach((module) => {
        console.log(module.name);
        module.run();
    });
});
Module('account-index',
    () => {
        return PAGE.startsWith('/account');
    },
    () => {
        $('.course-button').each((index, element) => {
            const courseName = $(element).data('course-name');
            console.log(courseName);
            $(element).click(() => {
                if (confirm(`Are you sure you want to remove ${courseName}?`)) {
                    $.post('/account/removecourse', { 'course-name': courseName }, (data) => {
                        location.reload();
                    });
                }
            });
        });
    }
);
/* MODULE FOR SPECIFC ASSIGNMENT DAY PAGE */
Module('assignments-date',
    () => {
        return PAGE.startsWith('/assignments/');
    },
    () => {
        const date = $('#date').data('date');
        const container = $('.assignments-container');
        const status = $('.assignments-status');

        let assignments = [];
        function updateAssignments(cb) {
            $.getJSON('/api/assignments/' + date)
                .done((ass) => {
                    console.log(ass);
                    assignments = ass;
                    cb(ass);
                })
                .fail((jqxhr, textStatus, error) => {
                    console.log(error);
                    alert('There was an error loading the assignments.');
                    location.reload();
                });
        }

        /* Turns the array of assignments into a object ordered by course name */
        function organizeAssignments(assignments) {
            let courses = [];
            let data = {};
            assignments.forEach((a) => { if (courses.indexOf(a.courseName) == -1) courses.push(a.courseName); })
            courses.forEach((c) => {
                // Assignments for this course
                data[c] = assignments.filter((a) => { return a.courseName == c; });
            })

            return data;
        } 

        function updateDisplay(assignments) {
            if (assignments.length == 0) {
                status.show();
                status.text('There are no assignments due this day.');
                return;
            }
            status.hide();
            assignments = organizeAssignments(assignments);
            container.empty();

            

            for(let courseName in assignments) {
                const items = assignments[courseName];
                const div = $('<div>', {
                    class: 'course-list col-xs-12 col-sm-6 col-md-4',
                    'data-course-name': courseName
                });
                const title = $('<h3>', {
                    class: 'course-name'
                });
                title.text(courseName);
                
                div.append(title);

                // List
                const list = $('<ul>');
                items.forEach((i) => {
                    const item = $('<li>', {
                        class: 'assignment' + (i.completed ? 'completed' : ''),
                        'data-assignment-id': i._id
                    });
                    item.text(i.description);

                    list.append(item);
                });
                div.append(list);

                container.append(div);
            }
        }

        $('.refresh-assignments').click(() => {
            console.log('a');
            updateAssignments((a) => {
                assignments = a;
                updateDisplay(assignments);
            });
        });

        updateAssignments((a) => {
            assignments = a;
            updateDisplay(assignments);
        });


        /* ADD ASSIGNMENTS */
        function addAssignment() {
            const description = $('#new-assignment-description').val().trim();
            const courseName = $('#new-assignment-course-name').val();
            if(!description || !courseName) return false;

            $.ajax({ 
                url: `/api/assignments/${date}/add`,
                type: 'PUT',
                data: {
                    courseName: courseName,
                    description: description
                },
                success: (data) => {
                    assignments.push(data);
                    updateDisplay(assignments);

                    $('#new-assignment-description').val('');
                },
                error: (jqXHR, textStatus, error) => {
                    alert('There was an error adding the assignment!');
                    return;
                }
            });
        }

        // Add assignment when button click or ENTER hit
        $('.add-assignment').click(addAssignment);
        $('#new-assignment-description').keydown((e) => {
            if(e.keyCode == 13){
                addAssignment();
            }
        })

    }
);
Module('assignments-index',
    () => {
        return PAGE.startsWith('/assignments');
    },
    () => {
        $('.calendar').fullCalendar({
            weekends: false,
            
        });
    }
);
Module('regis-schedule',
    () => {
        return ($('#upload-regis-schedule').length > 0);
    },
    () => {
        const button = $('#upload-regis-schedule');
        button.click(() => {
            button.text('Downloading...');
            $.ajax({
                url: 'http://intranet.regis.org/downloads/outlook_calendar_import/outlook_schedule_download.cfm',
                type: 'GET',
                crossDomain: true,
                dataType: 'jsonp',
                success: function (data) {
                    console.log(data);
                    button.text('Sucessfully downloaded schedule!');
                },
                error: function (xhr, status) {
                    alert('Failed to download Regis schedule automatically. Please make sure you are logged in to the Intranet.');
                    button.text('Failed to download schedule.');
                }
            });
        });
    }
);