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