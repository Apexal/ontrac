Module('work-index',
    () => {
        return PAGE.startsWith('/work');
    },
    () => {
        $('.calendar').fullCalendar({
            weekends: false,
            dayClick: function(date, jsEvent, view) {
                var dateString = date.format('YYYY-MM-DD');
                window.location.href = `/work/${dateString}`;
            },
            eventRender: function(event, element) {
                element.html(event.title);
            },
            eventSources: ['/api/assignments/events']
        });
    }
);