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
                    assignments = ass;
                    cb(ass);
                })
                .fail((jqxhr, textStatus, error) => {
                    console.log(error);
                    alert('There was an error loading the assignments.');
                    return;
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
                        class: 'assignment' + (i.completed ? ' completed' : ''),
                        'data-assignment-id': i._id
                    });
                    item.text(i.description);

                    list.append(item);
                });
                div.append(list);

                container.append(div);
            }
            updateEventHandlers();
        }

        $('.refresh-assignments').click(() => {
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
        });

        /* TOGGLE ASSIGNMENT COMPLETION STATUS */

        function toggleAssignment() {
            const assignmentId = $(this).data('assignment-id');            
            const newCompleted = !$(this).hasClass('completed');

            $.post(`/api/assignments/one/${assignmentId}`, { assignmentId: assignmentId, completed: newCompleted })
                .done((data) => {
                    for(let i in assignments) { if (assignments[i]._id == assignmentId) assignments[i] = data; }
                    updateDisplay(assignments);
                })
                .fail((err) => {
                    alert('There was an error!');
                    console.log(err);
                    return;
                });
        }

        function updateEventHandlers() {
            $('.assignment').click(toggleAssignment);
        }
        updateEventHandlers();
    }
);