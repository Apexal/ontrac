Module('account-index',
    () => {
        return PAGE.startsWith('/account');
    },
    () => {
        $('.course-button').each((index, element) => {
            const courseName = $(element).data('course-name');
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