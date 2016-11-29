/* MODULE FOR SPECIFC ASSIGNMENT DAY PAGE */
Module('assignments-date',
    () => {
        return PAGE.startsWith('/assignments/');
    },
    () => {
        const date = $('#date').data('date');
        const container = $('.assignments-container');
        const status = $('.assignments-status');
        const progressBar = $('.assignment-progress-bar');

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
                $('.assignment-count').text('0 total');
                $('.export-assignments').hide();
                progressBar.animate({ width: '0%' }, 500);
                progressBar.removeClass('full');
                progressBar.addClass('low');
                progressBar.attr('title', `You are 0% done with your assignments!`);
                $('.statistics span').text('0% completed');

                return;
            }
            status.hide();
            $('.export-assignments').show();
            
            // For statistics
            let total = assignments.length;
            $('.assignment-count').text(total + ' total');
            let completed = 0;

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
                    
                    if (i.completed) completed++;

                    const descriptionSpan = $('<span>', {
                        class: 'assignment-description'
                    });
                    descriptionSpan.text(i.description);
                    item.append(descriptionSpan);

                    // Remove button for non-phones
                    const removeButtonPC = $('<i>', {
                        class: 'fa fa-close remove-assignment hidden-xs hidden-sm hidden-md hidden-lg pc'
                    });

                    const removeButtonMobile = $('<i>', {
                        class: 'fa fa-close remove-assignment visible-xs hidden-sm hidden-md hidden-lg mobile'
                    });

                    item.append(removeButtonPC);
                    item.append(removeButtonMobile);
                    list.append(item);
                });
                div.append(list);
                container.append(div);
            }

            const percentDone = Math.round(( completed / total ) * 100);
            progressBar.animate({ width: percentDone+'%' }, 500);
            progressBar.removeClass('full');
            progressBar.removeClass('low');
            if (percentDone == 100)  {
                progressBar.addClass('full');
            } else if (percentDone < 34) {
                progressBar.addClass('low');
            }
            progressBar.attr('title', `You are ${percentDone}% done with your assignments!`);
            $('.statistics span').text(`${percentDone}% completed` + (( percentDone != 0 && percentDone != 100) ? ` (${completed} out of ${total})` : ''));

            updateEventHandlers();
        }

        $('.refresh-assignments').click(function() {
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

            if (!confirm('Remove assignment?')) return;

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

            // Hover remove buttons
            $('.assignment').each(function() {
                const span = $(this).find('.assignment-span');
                const removeIcon = $(this).find('i.remove-assignment.pc'); // Remove icon for non-phones

                $(this).hover(() => {
                    // On hover
                    removeIcon.removeClass('hidden-sm hidden-md hidden-lg');
                },
                () => {
                    // Off hover
                    removeIcon.addClass('hidden-sm hidden-md hidden-lg');
                });
            });
        }
        updateEventHandlers();
    }
);