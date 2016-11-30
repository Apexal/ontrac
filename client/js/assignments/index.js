Module('assignments-index',
    () => {
        return PAGE.startsWith('/assignments');
    },
    () => {
        $('.calendar').fullCalendar({
            weekends: false,
            dayClick: function(date, jsEvent, view) {
                var dateString = date.format('YYYY-MM-DD');
                window.location.href = `/assignments/${dateString}`;
            }
        });
    }
);