Module('account-index',
    () => {
        return PAGE.startsWith('/assignments');
    },
    () => {
        $('.calendar').fullCalendar({
            weekends: false,
            
        });
    }
);