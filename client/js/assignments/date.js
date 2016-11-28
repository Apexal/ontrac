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
                    return; // Does not reload the page as if the website crashses, reloading will lose the current data
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

        /* Takes the assignments array, organizes it, and then creates a display for it */
        function updateDisplay(assignments) {
            if (assignments.length == 0) {
                container.empty();
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
                    
                    const descriptionSpan = $('<span>', {
                        class: 'assignment-description'
                    });
                    descriptionSpan.text(i.description);
                    item.append(descriptionSpan);

                    // Remove button
                    const removeButton = $('<i>', {
                        class: 'fa fa-close remove-assignment'
                    });

                    item.append(removeButton);
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
            const assignmentId = $(this).parent().data('assignment-id');            
            const newCompleted = !$(this).parent().hasClass('completed');

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

        /* REMOVE ASSIGNMENT */
        function removeAssignment() {
            const assignmentId = $(this).parent().data('assignment-id');
            if (!assignmentId) return;

            $.ajax({
                url: '/api/assignments/one/' + assignmentId,
                method: 'DELETE',
                data: {
                    assignmentId: assignmentId
                }
            })
            .done((data) => {
                for(let i in assignments) { if (assignments[i]._id == assignmentId) assignments.splice(i, 1); }
                updateDisplay(assignments);
            })
            .fail((jqxhr, textStatus, error) => {
                console.log(error);
                alert('There was an error deleting the assignment.');
                return; 
            });
        }

        /* When the assignments are re-rendered it removes all the previous event handlers so they must be added back */
        function updateEventHandlers() {
            $('.assignment-description').off().click(toggleAssignment);
            $('.remove-assignment').off().click(removeAssignment);
        }
        updateEventHandlers();
    }
);